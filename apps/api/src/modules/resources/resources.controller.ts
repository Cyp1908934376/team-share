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
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ResourcesService } from './resources.service'
import { StorageService } from '../../common/storage/storage.service'
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AuditAction } from '../audit-logs/audit-log.interceptor'

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly storageService: StorageService,
  ) {}

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
  @ApiOperation({ summary: '下载资源（增加下载计数）' })
  async download(@Param('id') id: string) {
    return this.resourcesService.download(id)
  }

  @Post(':id/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传资源文件到 MinIO' })
  async uploadFile(
    @Param('id') id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id
    const objectName = `resources/${id}/${file.originalname}`
    await this.storageService.uploadFile('team-share', objectName, file.buffer, {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-ResourceId': id,
      'X-Amz-Meta-UploadedBy': userId,
    })

    // Update resource content with file reference
    await this.resourcesService.update(id, userId, {
      content: { file: objectName, originalName: file.originalname, size: file.size },
    } as any)

    return { success: true, objectName, size: file.size }
  }

  @Get(':id/file')
  @ApiOperation({ summary: '获取资源文件下载链接' })
  async getFileUrl(@Param('id') id: string) {
    const resource = await this.resourcesService.findById(id)
    const content = resource.content as Record<string, any> | null
    if (!content?.file) {
      return { url: null }
    }

    const url = await this.storageService.getPresignedUrl('team-share', content.file, 3600)
    return { url }
  }

  @Get(':id/file/download')
  @ApiOperation({ summary: '直接下载资源文件' })
  async downloadFile(@Param('id') id: string, @Res() res: any) {
    const resource = await this.resourcesService.findById(id)
    const content = resource.content as Record<string, any> | null
    if (!content?.file) {
      return res.status(404).json({ code: 404, message: '未找到文件' })
    }

    const fileBuffer = await this.storageService.getFile('team-share', content.file)
    res.set({
      'Content-Type': content.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${content.originalName || 'download'}"`,
    })
    res.send(fileBuffer)
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
