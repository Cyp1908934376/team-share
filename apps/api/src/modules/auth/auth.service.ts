import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../database/prisma/prisma.service'
import { RedisService } from '../../database/redis/redis.service'
import { RegisterDto, LoginDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
        ],
      },
    })

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        displayName: dto.displayName || dto.username,
        passwordHash,
      },
    })

    // Generate token
    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        role: user.role,
      },
      token,
    }
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.usernameOrEmail },
          { username: dto.usernameOrEmail },
        ],
      },
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Cache user session in Redis
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatarUrl,
      role: user.role,
    }
    await this.redisService.set(`session:${user.id}`, userData, 3600 * 24 * 7) // 7 days

    // Generate token
    const token = this.generateToken(user.id)

    return {
      user: userData,
      token,
    }
  }

  async validateUser(userId: string) {
    // Try Redis cache first
    const cached = await this.redisService.get<Record<string, unknown>>(`session:${userId}`)
    if (cached) {
      return cached
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    // Cache for subsequent requests
    await this.redisService.set(`session:${userId}`, user, 3600 * 24) // 24h

    return user
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw new BadRequestException('当前密码错误')
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { success: true }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: '如果该邮箱已注册，重置链接已发送' }
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password-reset' },
      { expiresIn: '15m' },
    )

    // Store in Redis for blacklisting capability
    await this.redisService.set(`reset-token:${user.id}`, resetToken, 900) // 15 min TTL

    // In production, send email. In dev, return token for testing.
    const isDev = this.configService.get('NODE_ENV') === 'development'

    return {
      success: true,
      message: '重置链接已发送至注册邮箱',
      ...(isDev ? { devToken: resetToken } : {}),
    }
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; purpose: string }
    try {
      payload = this.jwtService.verify(token)
    } catch {
      throw new BadRequestException('重置令牌无效或已过期')
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('无效的重置令牌')
    }

    // Verify token hasn't been used (optional: check Redis blacklist)
    const stored = await this.redisService.get(`reset-token:${payload.sub}`)
    if (!stored || stored !== token) {
      throw new BadRequestException('重置令牌已失效')
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    })

    // Invalidate the reset token
    await this.redisService.del(`reset-token:${payload.sub}`)

    return { success: true, message: '密码重置成功' }
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId })
  }
}
