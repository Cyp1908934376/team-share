import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuditLogsService } from './audit-logs.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: '获取审计日志列表' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.auditLogsService.findAll({
      userId,
      action,
      resourceType,
      resourceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    })
  }

  @Get('stats')
  @ApiOperation({ summary: '获取审计日志统计' })
  async getStats() {
    return this.auditLogsService.getStats()
  }

  @Get('recent')
  @ApiOperation({ summary: '获取最近活动' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.auditLogsService.getRecentActivity(
      limit ? parseInt(limit, 10) : 10
    )
  }

  @Get(':id')
  @ApiOperation({ summary: '获取审计日志详情' })
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findById(id)
  }
}
