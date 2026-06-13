import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface WechatMessage {
  title: string
  content: string
  messageUrl?: string
  mentionedList?: string[]
}

export interface DingtalkMessage {
  title: string
  content: string
  atMobiles?: string[]
  isAtAll?: boolean
}

/**
 * 企业微信 & 钉钉 消息推送服务
 *
 * 企业微信机器人: https://developer.work.weixin.qq.com/document/path/91770
 * 钉钉机器人: https://open.dingtalk.com/document/orgapp/custom-robot-access
 */
@Injectable()
export class WechatDingtalkService {
  private readonly logger = new Logger(WechatDingtalkService.name)
  private readonly wechatWebhookKeys: string[]
  private readonly dingtalkAccessTokens: string[]

  constructor(private configService: ConfigService) {
    // 支持多个 webhook key，逗号分隔
    const wechatKeys = this.configService.get<string>('WECHAT_WEBHOOK_KEYS', '')
    const dingtalkTokens = this.configService.get<string>('DINGTALK_ACCESS_TOKENS', '')

    this.wechatWebhookKeys = wechatKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    this.dingtalkAccessTokens = dingtalkTokens
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
  }

  // ==================== 企业微信 ====================

  /**
   * 发送企业微信群机器人消息 (Markdown 格式)
   */
  async sendWechatMarkdown(message: WechatMessage): Promise<boolean> {
    if (this.wechatWebhookKeys.length === 0) {
      this.logger.warn('未配置企业微信 Webhook，跳过发送')
      return false
    }

    const markdownContent = this.buildWechatMarkdown(message)
    const payload = {
      msgtype: 'markdown',
      markdown: {
        content: markdownContent,
      },
    }

    return this.sendToWechat(payload)
  }

  /**
   * 发送企业微信文本消息
   */
  async sendWechatText(content: string, mentionedList?: string[]): Promise<boolean> {
    if (this.wechatWebhookKeys.length === 0) {
      this.logger.warn('未配置企业微信 Webhook，跳过发送')
      return false
    }

    const payload: Record<string, any> = {
      msgtype: 'text',
      text: {
        content,
        ...(mentionedList ? { mentioned_list: mentionedList } : {}),
      },
    }

    return this.sendToWechat(payload)
  }

  private buildWechatMarkdown(message: WechatMessage): string {
    const lines: string[] = []
    lines.push(`## ${message.title}`)
    lines.push('')
    lines.push(message.content)
    if (message.messageUrl) {
      lines.push('')
      lines.push(`[查看详情](${message.messageUrl})`)
    }
    if (message.mentionedList && message.mentionedList.length > 0) {
      lines.push('')
      lines.push(message.mentionedList.map((u) => `<@${u}>`).join(' '))
    }
    return lines.join('\n')
  }

  private async sendToWechat(payload: Record<string, any>): Promise<boolean> {
    const results = await Promise.allSettled(
      this.wechatWebhookKeys.map(async (key) => {
        const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result: any = await response.json()
        if (result.errcode !== 0) {
          throw new Error(`企业微信 API 错误 [${result.errcode}]: ${result.errmsg}`)
        }
        return result
      }),
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    if (failed > 0) {
      this.logger.error(`企业微信消息发送: ${succeeded} 成功, ${failed} 失败`)
    } else {
      this.logger.log(`企业微信消息发送成功 (${succeeded} 个 webhook)`)
    }

    return succeeded > 0
  }

  // ==================== 钉钉 ====================

  /**
   * 发送钉钉群机器人消息 (Markdown 格式)
   */
  async sendDingtalkMarkdown(message: DingtalkMessage): Promise<boolean> {
    if (this.dingtalkAccessTokens.length === 0) {
      this.logger.warn('未配置钉钉 Access Token，跳过发送')
      return false
    }

    const text = this.buildDingtalkMarkdown(message)
    const payload: Record<string, any> = {
      msgtype: 'markdown',
      markdown: {
        title: message.title,
        text,
      },
      at: {
        atMobiles: message.atMobiles || [],
        isAtAll: message.isAtAll || false,
      },
    }

    return this.sendToDingtalk(payload)
  }

  /**
   * 发送钉钉文本消息
   */
  async sendDingtalkText(content: string, atMobiles?: string[], isAtAll?: boolean): Promise<boolean> {
    if (this.dingtalkAccessTokens.length === 0) {
      this.logger.warn('未配置钉钉 Access Token，跳过发送')
      return false
    }

    const payload: Record<string, any> = {
      msgtype: 'text',
      text: {
        content,
      },
      at: {
        atMobiles: atMobiles || [],
        isAtAll: isAtAll || false,
      },
    }

    return this.sendToDingtalk(payload)
  }

  private buildDingtalkMarkdown(message: DingtalkMessage): string {
    const lines: string[] = []
    lines.push(`## ${message.title}`)
    lines.push('')
    lines.push(message.content)
    if (message.atMobiles && message.atMobiles.length > 0) {
      lines.push('')
      lines.push(message.atMobiles.map((m) => `@${m}`).join(' '))
    }
    return lines.join('\n')
  }

  private async sendToDingtalk(payload: Record<string, any>): Promise<boolean> {
    const results = await Promise.allSettled(
      this.dingtalkAccessTokens.map(async (token) => {
        const url = `https://oapi.dingtalk.com/robot/send?access_token=${token}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result: any = await response.json()
        if (result.errcode !== 0) {
          throw new Error(`钉钉 API 错误 [${result.errcode}]: ${result.errmsg}`)
        }
        return result
      }),
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    if (failed > 0) {
      this.logger.error(`钉钉消息发送: ${succeeded} 成功, ${failed} 失败`)
    } else {
      this.logger.log(`钉钉消息发送成功 (${succeeded} 个 token)`)
    }

    return succeeded > 0
  }

  // ==================== 统一发送接口 ====================

  /**
   * 向所有已配置的渠道发送告警/通知
   */
  async sendAlert(params: {
    title: string
    content: string
    level?: 'info' | 'warning' | 'critical'
    messageUrl?: string
  }): Promise<{ wechat: boolean; dingtalk: boolean }> {
    const { title, content, level, messageUrl } = params

    // 根据告警等级加 emoji 前缀
    const levelEmoji = level === 'critical' ? '🔴' : level === 'warning' ? '🟡' : '🔵'
    const fullTitle = `${levelEmoji} ${title}`

    const [wechat, dingtalk] = await Promise.all([
      this.sendWechatMarkdown({ title: fullTitle, content, messageUrl }),
      this.sendDingtalkMarkdown({ title: fullTitle, content }),
    ])

    return { wechat, dingtalk }
  }
}
