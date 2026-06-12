import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateEnvironmentDto {
  @ApiProperty({ description: '环境名称', example: 'development' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ description: '显示名称', example: '开发环境' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({ description: '环境描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '团队 ID' })
  @IsOptional()
  @IsString()
  teamId?: string

  @ApiPropertyOptional({ description: '环境变量' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>

  @ApiPropertyOptional({ description: '密钥' })
  @IsOptional()
  @IsObject()
  secrets?: Record<string, any>

  @ApiPropertyOptional({ description: '依赖' })
  @IsOptional()
  @IsObject()
  dependencies?: Record<string, any>
}

export class UpdateEnvironmentDto {
  @ApiPropertyOptional({ description: '环境名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ description: '显示名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({ description: '环境描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '环境变量' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>

  @ApiPropertyOptional({ description: '密钥' })
  @IsOptional()
  @IsObject()
  secrets?: Record<string, any>

  @ApiPropertyOptional({ description: '依赖' })
  @IsOptional()
  @IsObject()
  dependencies?: Record<string, any>

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string
}
