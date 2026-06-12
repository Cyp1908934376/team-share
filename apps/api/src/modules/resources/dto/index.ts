import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateResourceDto {
  @ApiProperty({ description: '资源类型', example: 'prompt' })
  @IsString()
  type: string

  @ApiProperty({ description: '资源名称', example: 'API 提示词模板' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '资源描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '资源内容' })
  @IsOptional()
  @IsObject()
  content?: any

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ description: '标签', example: ['api', 'template'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: '可见性', enum: ['public', 'team', 'private'] })
  @IsOptional()
  @IsEnum(['public', 'team', 'private'])
  visibility?: string

  @ApiPropertyOptional({ description: '团队 ID' })
  @IsOptional()
  @IsString()
  teamId?: string
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ description: '资源名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '资源描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '资源内容' })
  @IsOptional()
  @IsObject()
  content?: any

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: '可见性' })
  @IsOptional()
  @IsEnum(['public', 'team', 'private'])
  visibility?: string
}

export class QueryResourceDto {
  @ApiPropertyOptional({ description: '资源类型' })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: '标签（逗号分隔）' })
  @IsOptional()
  @IsString()
  tags?: string

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20
}
