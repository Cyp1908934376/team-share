import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MonitoringService } from './monitoring.service'

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取仪表盘概览数据' })
  async getDashboard() {
    return this.monitoringService.getDashboard()
  }

  @Get('stats')
  @ApiOperation({ summary: '获取系统统计概览' })
  async getStats() {
    return this.monitoringService.getStats()
  }

  @Get('resources')
  @ApiOperation({ summary: '获取资源统计' })
  async getResourceStats() {
    return this.monitoringService.getResourceStats()
  }

  @Get('workflows')
  @ApiOperation({ summary: '获取工作流统计' })
  async getWorkflowStats() {
    return this.monitoringService.getWorkflowStats()
  }

  @Get('activity')
  @ApiOperation({ summary: '获取最近活动' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.monitoringService.getRecentActivity(
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Get('activities')
  @ApiOperation({ summary: '获取最近活动（别名）' })
  async getRecentActivities(@Query('limit') limit?: string) {
    return this.monitoringService.getRecentActivity(
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Get('health')
  @ApiOperation({ summary: '获取系统健康状态' })
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth()
  }
}
