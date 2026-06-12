import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '显示名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ description: '用户偏好设置' })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>
}
