import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { PrismaService } from '../../../database/prisma/prisma.service'
import { QueueService } from '../../../common/queue/queue.service'

@Injectable()
export class CronSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CronSchedulerService.name)
  private scheduledJobs = new Map<string, string>() // workflowId -> cronJob name

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // Load all active cron-triggered workflows on startup
    await this.loadActiveCronWorkflows()
  }

  private async loadActiveCronWorkflows() {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: {
          status: 'active',
          triggerConfig: {
            path: ['type'],
            equals: 'cron',
          },
        },
      })

      for (const workflow of workflows) {
        const triggerConfig = workflow.triggerConfig as Record<string, any>
        if (triggerConfig?.cron) {
          this.registerCron(workflow.id, triggerConfig.cron)
        }
      }

      this.logger.log(`已加载 ${workflows.length} 个定时工作流`)
    } catch (error) {
      this.logger.warn(`加载定时工作流失败: ${(error as Error).message}`)
    }
  }

  registerCron(workflowId: string, cronExpression: string) {
    const jobName = `workflow-cron-${workflowId}`

    // Remove existing job if present
    this.unregisterCron(workflowId)

    try {
      const job = new CronJob(cronExpression, async () => {
        this.logger.log(`触发定时工作流: ${workflowId}`)
        try {
          const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
          })
          if (!workflow || workflow.status !== 'active') {
            this.unregisterCron(workflowId)
            return
          }

          const execution = await this.prisma.workflowExecution.create({
            data: {
              workflowId,
              status: 'pending',
              trigger: 'cron',
              inputs: {},
            },
          })

          await this.queueService.addWorkflowJob({
            workflowId,
            executionId: execution.id,
            nodes: (workflow.nodes as any[]) || [],
            edges: (workflow.edges as any[]) || [],
            variables: (workflow.variables as Record<string, any>) || {},
          })
        } catch (error) {
          this.logger.error(`定时工作流执行失败: ${workflowId} - ${(error as Error).message}`)
        }
      })

      this.schedulerRegistry.addCronJob(jobName, job)
      job.start()
      this.scheduledJobs.set(workflowId, jobName)
      this.logger.log(`已注册定时工作流: ${workflowId} (${cronExpression})`)
    } catch (error) {
      this.logger.error(`注册定时工作流失败: ${workflowId} - ${(error as Error).message}`)
    }
  }

  unregisterCron(workflowId: string) {
    const jobName = this.scheduledJobs.get(workflowId)
    if (jobName) {
      try {
        this.schedulerRegistry.deleteCronJob(jobName)
        this.scheduledJobs.delete(workflowId)
        this.logger.log(`已注销定时工作流: ${workflowId}`)
      } catch (error) {
        // Job may already not exist
      }
    }
  }

  getScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys())
  }
}
