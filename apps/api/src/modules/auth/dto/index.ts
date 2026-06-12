import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string

  @ApiPropertyOptional({ description: '显示名称', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string
}

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱', example: 'john@example.com' })
  @IsString()
  usernameOrEmail: string

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  password: string
}
