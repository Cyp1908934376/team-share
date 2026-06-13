import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { QueueService } from '../../common/queue/queue.service'
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto'

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name)

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async findAll(teamId?: string) {
    const where = teamId ? { teamId } : {}

    return this.prisma.workflow.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findById(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!workflow) {
      throw new NotFoundException('工作流不存在')
    }

    return workflow
  }

  async create(dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        description: dto.description,
        teamId: dto.teamId,
        triggerConfig: dto.triggerConfig || {},
        nodes: dto.nodes || [],
        edges: dto.edges || [],
        variables: dto.variables || {},
        timeout: dto.timeout || 3600,
        retryPolicy: dto.retryPolicy || {},
      },
    })
  }

  async update(id: string, dto: UpdateWorkflowDto) {
    await this.findById(id)

    return this.prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        triggerConfig: dto.triggerConfig,
        nodes: dto.nodes,
        edges: dto.edges,
        variables: dto.variables,
        timeout: dto.timeout,
        retryPolicy: dto.retryPolicy,
        status: dto.status,
      },
    })
  }

  async delete(id: string) {
    await this.findById(id)

    await this.prisma.workflow.delete({ where: { id } })

    return { success: true }
  }

  async execute(id: string, inputs?: Record<string, any>) {
    const workflow = await this.findById(id)

    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'pending',
        trigger: 'manual',
        inputs: inputs || {},
      },
    })

    // Enqueue workflow for async execution via BullMQ
    await this.queueService.addWorkflowJob({
      workflowId: id,
      executionId: execution.id,
      nodes: (workflow.nodes as any[]) || [],
      edges: (workflow.edges as any[]) || [],
      variables: { ...(workflow.variables as Record<string, any>), ...inputs },
    })

    this.logger.log(`工作流 ${id} 已加入执行队列 (execution: ${execution.id})`)

    return { executionId: execution.id, status: 'pending' }
  }

  async getExecutions(workflowId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getExecution(workflowId: string, executionId: string) {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        workflowId,
      },
    })

    if (!execution) {
      throw new NotFoundException('执行记录不存在')
    }

    return execution
  }

  async cancelExecution(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
    })

    if (!execution) {
      throw new NotFoundException('执行记录不存在')
    }

    if (execution.status !== 'running' && execution.status !== 'pending') {
      return { success: false, message: '只能取消正在运行或等待中的执行' }
    }

    // Cancel the BullMQ job
    await this.queueService.cancelWorkflowJob(executionId)

    // Update execution status
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'cancelled',
        finishedAt: new Date(),
      },
    })

    return { success: true }
  }
}
