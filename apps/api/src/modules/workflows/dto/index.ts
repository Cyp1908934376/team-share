import { IsString, IsOptional, IsObject, IsArray, IsInt, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateWorkflowDto {
  @ApiProperty({ description: '工作流名称', example: '一键部署' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '工作流描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '团队 ID' })
  @IsOptional()
  @IsString()
  teamId?: string

  @ApiPropertyOptional({ description: '触发配置' })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>

  @ApiPropertyOptional({ description: '节点列表' })
  @IsOptional()
  @IsArray()
  nodes?: any[]

  @ApiPropertyOptional({ description: '边列表' })
  @IsOptional()
  @IsArray()
  edges?: any[]

  @ApiPropertyOptional({ description: '变量' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>

  @ApiPropertyOptional({ description: '超时时间（秒）', default: 3600 })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeout?: number

  @ApiPropertyOptional({ description: '重试策略' })
  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, any>
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: '工作流名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '工作流描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '触发配置' })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>

  @ApiPropertyOptional({ description: '节点列表' })
  @IsOptional()
  @IsArray()
  nodes?: any[]

  @ApiPropertyOptional({ description: '边列表' })
  @IsOptional()
  @IsArray()
  edges?: any[]

  @ApiPropertyOptional({ description: '变量' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>

  @ApiPropertyOptional({ description: '超时时间（秒）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeout?: number

  @ApiPropertyOptional({ description: '重试策略' })
  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, any>

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string
}
