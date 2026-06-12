import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  async findAll(
    @Request() req,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.notificationsService.findAll(req.user.id, {
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    })
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id)
  }

  @Post('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.id)
  }
}
