import { Module } from '@nestjs/common'
import { MonitoringService } from './monitoring.service'
import { MonitoringController } from './monitoring.controller'
import { MetricsController } from './metrics.controller'

@Module({
  controllers: [MonitoringController, MetricsController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
