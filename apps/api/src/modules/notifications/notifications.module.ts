import { Module, Global, OnModuleInit } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { NotificationsGateway } from './notifications.gateway'
import { WechatDingtalkService } from '../../common/notifications/messaging.service'
import { NotificationProcessor } from '../../common/queue/processors/notification.processor'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'default-secret'),
      }),
    }),
    BullModule.registerQueue({ name: 'notification-dispatch' }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    WechatDingtalkService,
    NotificationProcessor,
  ],
  exports: [NotificationsService, NotificationsGateway, WechatDingtalkService],
})
export class NotificationsModule implements OnModuleInit {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    this.notificationsService.setGateway(this.gateway)
  }
}
