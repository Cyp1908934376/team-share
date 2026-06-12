import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { WorkflowsService } from './workflows.service'
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AuditAction } from '../audit-logs/audit-log.interceptor'

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ summary: '获取工作流列表' })
  async findAll(@Query('teamId') teamId?: string) {
    return this.workflowsService.findAll(teamId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工作流详情' })
  async findOne(@Param('id') id: string) {
    return this.workflowsService.findById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('workflow.create')
  @ApiOperation({ summary: '创建工作流' })
  async create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新工作流' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除工作流' })
  async delete(@Param('id') id: string) {
    return this.workflowsService.delete(id)
  }

  @Post(':id/execute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AuditAction('workflow.execute')
  @ApiOperation({ summary: '执行工作流' })
  async execute(
    @Param('id') id: string,
    @Body() body?: { inputs?: Record<string, any> }
  ) {
    return this.workflowsService.execute(id, body?.inputs)
  }

  @Get(':id/executions')
  @ApiOperation({ summary: '获取工作流执行记录' })
  async getExecutions(@Param('id') id: string) {
    return this.workflowsService.getExecutions(id)
  }

  @Get(':id/executions/:executionId')
  @ApiOperation({ summary: '获取执行记录详情' })
  async getExecution(
    @Param('id') id: string,
    @Param('executionId') executionId: string
  ) {
    return this.workflowsService.getExecution(id, executionId)
  }

  @Post('executions/:executionId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消工作流执行' })
  async cancelExecution(@Param('executionId') executionId: string) {
    return this.workflowsService.cancelExecution(executionId)
  }
}
