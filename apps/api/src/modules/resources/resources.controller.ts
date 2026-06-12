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
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ResourcesService } from './resources.service'
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AuditAction } from '../audit-logs/audit-log.interceptor'

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: '获取资源列表' })
  async findAll(@Query() query: QueryResourceDto) {
    return this.resourcesService.findAll(query)
  }

  @Get('starred')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取收藏的资源' })
  async getStarred(@Request() req) {
    return this.resourcesService.getStarredResources(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取资源详情' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id
    return this.resourcesService.findById(id, userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('resource.create')
  @ApiOperation({ summary: '创建资源' })
  async create(@Request() req, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(req.user.id, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('resource.update')
  @ApiOperation({ summary: '更新资源' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateResourceDto
  ) {
    return this.resourcesService.update(id, req.user.id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('resource.delete')
  @ApiOperation({ summary: '删除资源' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.resourcesService.delete(id, req.user.id)
  }

  @Post(':id/star')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏/取消收藏资源' })
  async star(@Param('id') id: string, @Request() req) {
    return this.resourcesService.star(id, req.user.id)
  }

  @Post(':id/download')
  @ApiOperation({ summary: '下载资源' })
  async download(@Param('id') id: string) {
    return this.resourcesService.download(id)
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('resource.publish')
  @ApiOperation({ summary: '发布资源' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.resourcesService.publish(id, req.user.id)
  }
}
