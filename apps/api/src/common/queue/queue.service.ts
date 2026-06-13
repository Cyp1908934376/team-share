import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue, Job } from 'bullmq'

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)

  constructor(
    @InjectQueue('workflow-execution') private readonly workflowQueue: Queue,
    @InjectQueue('notification-dispatch') private readonly notificationQueue: Queue,
  ) {}

  // Workflow execution jobs
  async addWorkflowJob(data: {
    workflowId: string
    executionId: string
    nodes: any[]
    edges: any[]
    variables: Record<string, any>
    delay?: number
  }): Promise<Job> {
    const job = await this.workflowQueue.add('execute', data, {
      jobId: data.executionId,
      delay: data.delay,
    })
    this.logger.log(`工作流任务已入队: ${job.id}`)
    return job
  }

  async getWorkflowJob(jobId: string): Promise<Job | undefined> {
    return this.workflowQueue.getJob(jobId)
  }

  async getWorkflowJobState(jobId: string): Promise<string> {
    const job = await this.getWorkflowJob(jobId)
    if (!job) return 'unknown'
    return job.getState()
  }

  async cancelWorkflowJob(jobId: string): Promise<void> {
    const job = await this.getWorkflowJob(jobId)
    if (job) {
      await job.moveToFailed(new Error('Cancelled by user'), 'cancelled')
      this.logger.log(`工作流任务已取消: ${jobId}`)
    }
  }

  // Notification dispatch jobs
  async addNotificationJob(data: {
    notificationId: string
    userId: string
    type: string
    title: string
    message?: string
    channels?: string[]
  }): Promise<Job> {
    const job = await this.notificationQueue.add('dispatch', data)
    this.logger.log(`通知分发任务已入队: ${job.id}`)
    return job
  }

  // Queue stats
  async getWorkflowQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.workflowQueue.getWaitingCount(),
      this.workflowQueue.getActiveCount(),
      this.workflowQueue.getCompletedCount(),
      this.workflowQueue.getFailedCount(),
      this.workflowQueue.getDelayedCount(),
    ])
    return { waiting, active, completed, failed, delayed }
  }

  async getNotificationQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
    ])
    return { waiting, active, completed, failed }
  }
}
