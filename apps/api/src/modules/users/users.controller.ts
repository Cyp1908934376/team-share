import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id)
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Get(':id/resources')
  @ApiOperation({ summary: '获取用户的资源列表' })
  async getUserResources(@Param('id') id: string) {
    return this.usersService.getResources(id)
  }
}
