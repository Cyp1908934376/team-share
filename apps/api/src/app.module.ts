import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './database/prisma/prisma.module'
import { RedisModule } from './database/redis/redis.module'
import { StorageModule } from './common/storage/storage.module'
import { QueueModule } from './common/queue/queue.module'
import { MetricsModule } from './common/metrics/metrics.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TeamsModule } from './modules/teams/teams.module'
import { ResourcesModule } from './modules/resources/resources.module'
import { EnvironmentsModule } from './modules/environments/environments.module'
import { WorkflowsModule } from './modules/workflows/workflows.module'
import { VersionsModule } from './modules/versions/versions.module'
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module'
import { AuditLogInterceptor } from './modules/audit-logs/audit-log.interceptor'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MonitoringModule } from './modules/monitoring/monitoring.module'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database & Cache & Storage & Queue
    PrismaModule,
    RedisModule,
    StorageModule,
    QueueModule,
    MetricsModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    TeamsModule,
    ResourcesModule,
    EnvironmentsModule,
    WorkflowsModule,
    VersionsModule,
    AuditLogsModule,
    NotificationsModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
