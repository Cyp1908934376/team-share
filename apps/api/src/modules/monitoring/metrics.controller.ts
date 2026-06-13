import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MetricsService } from '../../common/metrics/metrics.service'

@ApiTags('monitoring')
@Controller('monitoring')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus 指标' })
  async getMetrics() {
    return this.metricsService.getMetrics()
  }
}
