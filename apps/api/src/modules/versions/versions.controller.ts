import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { VersionsService } from './versions.service'
import { CreateVersionDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('versions')
@Controller('resources/:resourceId/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  @ApiOperation({ summary: '获取资源版本列表' })
  async findAll(@Param('resourceId') resourceId: string) {
    return this.versionsService.findByResource(resourceId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取版本详情' })
  async findOne(@Param('id') id: string) {
    return this.versionsService.findById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建版本' })
  async create(
    @Param('resourceId') resourceId: string,
    @Request() req,
    @Body() dto: CreateVersionDto
  ) {
    return this.versionsService.create(resourceId, req.user.id, dto)
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布版本' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.versionsService.publish(id, req.user.id)
  }

  @Get('diff')
  @ApiOperation({ summary: '对比两个版本' })
  async diff(
    @Query('from') fromId: string,
    @Query('to') toId: string
  ) {
    return this.versionsService.diff(fromId, toId)
  }
}
