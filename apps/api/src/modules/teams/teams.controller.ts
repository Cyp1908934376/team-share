import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TeamsService } from './teams.service'
import { CreateTeamDto, UpdateTeamDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: '获取团队列表' })
  async findAll() {
    return this.teamsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取团队详情' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建团队' })
  async create(@Request() req, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(req.user.id, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新团队' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateTeamDto
  ) {
    return this.teamsService.update(id, req.user.id, dto)
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加团队成员' })
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string }
  ) {
    return this.teamsService.addMember(id, body.userId, body.role)
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '移除团队成员' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.teamsService.removeMember(id, userId)
  }
}
