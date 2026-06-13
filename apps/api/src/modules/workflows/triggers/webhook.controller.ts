import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PrismaService } from '../../../database/prisma/prisma.service'
import { QueueService } from '../../../common/queue/queue.service'

@ApiTags('workflows')
@Controller('workflows')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  @Post(':id/webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: '通过 Webhook 触发工作流' })
  async triggerWebhook(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
    @Headers('x-webhook-secret') secret?: string,
  ) {
    // Find the workflow
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    })

    if (!workflow) {
      return { accepted: false, reason: '工作流不存在' }
    }

    if (workflow.status !== 'active') {
      return { accepted: false, reason: '工作流未激活' }
    }

    // Validate trigger config
    const triggerConfig = workflow.triggerConfig as Record<string, any>
    if (triggerConfig?.type !== 'webhook') {
      return { accepted: false, reason: '工作流未启用 Webhook 触发' }
    }

    // Validate secret if configured
    if (triggerConfig?.webhook?.secret && triggerConfig.webhook.secret !== secret) {
      return { accepted: false, reason: '密钥验证失败' }
    }

    // Create execution and enqueue
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'pending',
        trigger: 'webhook',
        inputs: { payload, headers: { secret: secret ? '***' : undefined } },
      },
    })

    await this.queueService.addWorkflowJob({
      workflowId: id,
      executionId: execution.id,
      nodes: (workflow.nodes as any[]) || [],
      edges: (workflow.edges as any[]) || [],
      variables: {
        ...(workflow.variables as Record<string, any>),
        webhookPayload: payload,
      },
    })

    this.logger.log(`Webhook 触发工作流: ${id} -> execution: ${execution.id}`)

    return { accepted: true, executionId: execution.id }
  }
}
