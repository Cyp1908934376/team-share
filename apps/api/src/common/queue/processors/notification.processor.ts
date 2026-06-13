import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { WechatDingtalkService } from '../../notifications/messaging.service'

@Processor('notification-dispatch')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(
    private readonly messagingService: WechatDingtalkService,
  ) {
    super()
  }

  async process(job: Job<{
    notificationId: string
    userId: string
    type: string
    title: string
    message?: string
    channels?: string[]
    metadata?: Record<string, any>
  }>): Promise<any> {
    const {
      notificationId,
      userId,
      type,
      title,
      message = '',
      channels = ['websocket'],
      metadata = {},
    } = job.data

    this.logger.log(`分发通知: ${notificationId} -> ${type} (渠道: ${channels.join(',')})`)

    const results: Record<string, boolean> = {}

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'websocket':
            // WebSocket push handled by NotificationsGateway
            results.websocket = true
            break

          case 'wechat':
            results.wechat = await this.messagingService.sendWechatMarkdown({
              title,
              content: message || title,
              messageUrl: metadata?.url,
            })
            break

          case 'dingtalk':
            results.dingtalk = await this.messagingService.sendDingtalkMarkdown({
              title,
              content: message || title,
            })
            break

          case 'email':
            this.logger.log(`[Email] 发送邮件通知: ${title}`)
            results.email = true
            break

          default:
            this.logger.warn(`未知通知渠道: ${channel}`)
            results[channel] = false
        }
      } catch (error: any) {
        this.logger.error(`渠道 ${channel} 通知失败: ${error.message}`)
        results[channel] = false
      }
    }

    return results
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`通知分发完成: ${job.id}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`通知分发失败: ${job.id} - ${error.message}`)
  }
}
