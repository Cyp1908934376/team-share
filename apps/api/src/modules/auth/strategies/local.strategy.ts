import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../../database/prisma/prisma.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      usernameField: 'usernameOrEmail',
    })
  }

  async validate(usernameOrEmail: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
      },
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
  }
}
