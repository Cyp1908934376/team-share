import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { EnvironmentsService } from './environments.service'
import { CreateEnvironmentDto, UpdateEnvironmentDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AuditAction } from '../audit-logs/audit-log.interceptor'

@ApiTags('environments')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  @ApiOperation({ summary: '获取环境列表' })
  async findAll(@Query('teamId') teamId?: string) {
    return this.environmentsService.findAll(teamId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取环境详情' })
  async findOne(@Param('id') id: string) {
    return this.environmentsService.findById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('environment.create')
  @ApiOperation({ summary: '创建环境' })
  async create(@Body() dto: CreateEnvironmentDto) {
    return this.environmentsService.create(dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新环境' })
  async update(@Param('id') id: string, @Body() dto: UpdateEnvironmentDto) {
    return this.environmentsService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除环境' })
  async delete(@Param('id') id: string) {
    return this.environmentsService.delete(id)
  }

  @Post(':id/snapshot')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('environment.snapshot')
  @ApiOperation({ summary: '创建环境快照' })
  async snapshot(
    @Param('id') id: string,
    @Body() body?: { name?: string; description?: string }
  ) {
    return this.environmentsService.snapshot(id, body?.name, body?.description)
  }

  @Get(':id/snapshots')
  @ApiOperation({ summary: '获取环境快照列表' })
  async getSnapshots(@Param('id') id: string) {
    return this.environmentsService.getSnapshots(id)
  }

  @Post('snapshots/:snapshotId/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('environment.restore')
  @ApiOperation({ summary: '恢复环境快照' })
  async restoreSnapshot(@Param('snapshotId') snapshotId: string) {
    return this.environmentsService.restoreSnapshot(snapshotId)
  }

  @Delete('snapshots/:snapshotId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除环境快照' })
  async deleteSnapshot(@Param('snapshotId') snapshotId: string) {
    return this.environmentsService.deleteSnapshot(snapshotId)
  }

  @Get(':id/health')
  @ApiOperation({ summary: '获取环境健康状态' })
  async getHealth(@Param('id') id: string) {
    return this.environmentsService.getHealth(id)
  }
}
