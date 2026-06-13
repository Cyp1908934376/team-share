import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator'

export class CreateNotificationDto {
  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '通知类型' })
  @IsString()
  type: string

  @ApiProperty({ description: '通知标题' })
  @IsString()
  title: string

  @ApiPropertyOptional({ description: '通知消息内容' })
  @IsOptional()
  @IsString()
  message?: string

  @ApiPropertyOptional({ description: '附加数据' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>
}

export class QueryNotificationDto {
  @ApiPropertyOptional({ description: '按已读/未读过滤' })
  @IsOptional()
  @IsBoolean()
  read?: boolean

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  pageSize?: number
}
