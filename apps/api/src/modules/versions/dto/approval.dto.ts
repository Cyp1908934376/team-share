import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum } from 'class-validator'

export enum ApprovalAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class SubmitReviewDto {
  @ApiPropertyOptional({ description: '审核说明' })
  @IsOptional()
  @IsString()
  comment?: string
}

export class ApprovalDto {
  @ApiPropertyOptional({ description: '审核意见' })
  @IsOptional()
  @IsString()
  comment?: string
}
