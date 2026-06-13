import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma/prisma.service'
import { WorkflowEngine } from '../../../modules/workflows/workflow-engine'

@Processor('workflow-execution')
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: WorkflowEngine,
  ) {
    super()
  }

  async process(job: Job<{
    workflowId: string
    executionId: string
    nodes: any[]
    edges: any[]
    variables: Record<string, any>
  }>): Promise<any> {
    const { workflowId, executionId, nodes, edges, variables } = job.data

    this.logger.log(`开始执行工作流: ${workflowId}, 执行ID: ${executionId}`)

    // Update execution status to running
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    })

    try {
      const result = await this.engine.execute(workflowId, executionId, nodes, edges, variables)

      if (result.success && !result.cancelled) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'success',
            finishedAt: new Date(),
            outputs: result.outputs || {},
          },
        })
      }

      return result
    } catch (error: any) {
      this.logger.error(`工作流执行失败: ${executionId} - ${error.message}`)

      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          outputs: { error: error.message },
        },
      })

      throw error
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`工作流任务完成: ${job.id}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`工作流任务失败: ${job.id} - ${error.message}`)
  }
}
