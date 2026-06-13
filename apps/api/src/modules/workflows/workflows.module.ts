import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ScheduleModule } from '@nestjs/schedule'
import { WorkflowsService } from './workflows.service'
import { WorkflowsController } from './workflows.controller'
import { WebhookController } from './triggers/webhook.controller'
import { CronSchedulerService } from './triggers/cron-scheduler.service'
import { WorkflowEngine } from './workflow-engine'
import { WorkflowProcessor } from '../../common/queue/processors/workflow.processor'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'workflow-execution' }),
    ScheduleModule.forRoot(),
  ],
  controllers: [WorkflowsController, WebhookController],
  providers: [WorkflowsService, WorkflowEngine, WorkflowProcessor, CronSchedulerService],
  exports: [WorkflowsService, WorkflowEngine],
})
export class WorkflowsModule {}
