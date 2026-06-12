import { IsString, IsOptional, IsObject, IsArray } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateVersionDto {
  @ApiPropertyOptional({ description: '版本号', example: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string

  @ApiPropertyOptional({ description: '版本标签', example: 'latest' })
  @IsOptional()
  @IsString()
  tag?: string

  @ApiPropertyOptional({ description: '变更说明' })
  @IsOptional()
  @IsString()
  changelog?: string

  @ApiPropertyOptional({ description: '版本内容' })
  @IsOptional()
  @IsObject()
  content?: any

  @ApiPropertyOptional({ description: '依赖列表' })
  @IsOptional()
  @IsArray()
  dependencies?: any[]
}
