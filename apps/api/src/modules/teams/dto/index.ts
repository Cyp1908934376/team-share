import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTeamDto {
  @ApiProperty({ description: '团队名称', example: '前端团队' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ description: '团队描述' })
  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ description: '团队名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ description: '团队描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '团队设置' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>
}
