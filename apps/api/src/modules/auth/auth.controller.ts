import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.id)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword)
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码 - 发送重置令牌' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email)
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(
    @Body() body: { token: string; newPassword: string }
  ) {
    return this.authService.resetPassword(body.token, body.newPassword)
  }
}
