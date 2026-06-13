import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { QueueService } from './queue.service'

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600 * 24, // keep completed jobs for 1 day
          },
          removeOnFail: {
            age: 3600 * 24 * 7, // keep failed jobs for 7 days
          },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'workflow-execution' },
      { name: 'notification-dispatch' },
    ),
  ],
  providers: [QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
