import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FocusSessionsService } from './focus-sessions.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { FocusSessionEntity } from './entities/focus-session.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('focus-sessions')
@Controller('focus-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FocusSessionsController {
  constructor(private readonly focusSessionsService: FocusSessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new focus session' })
  @ApiResponse({
    status: 201,
    description: 'The focus session has been successfully created.',
    type: FocusSessionEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Body() createFocusSessionDto: CreateFocusSessionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.focusSessionsService.create(createFocusSessionDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all focus sessions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all focus sessions.',
    type: [FocusSessionEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('taskId') taskId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filters: {
      taskId?: string;
      from?: Date;
      to?: Date;
    } = {};

    if (taskId) {
      filters.taskId = taskId;
    }
    if (from) {
      filters.from = new Date(from);
    }
    if (to) {
      filters.to = new Date(to);
    }

    return this.focusSessionsService.findAll(user.id, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get focus session statistics' })
  @ApiResponse({
    status: 200,
    description: 'Focus session statistics.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getStats(@CurrentUser() user: { id: string }, @Query('days') days?: string) {
    const daysCount = days ? parseInt(days, 10) : 30;
    return this.focusSessionsService.getStats(user.id, daysCount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a focus session by ID' })
  @ApiResponse({
    status: 200,
    description: 'The focus session found.',
    type: FocusSessionEntity,
  })
  @ApiResponse({ status: 404, description: 'Focus session not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.focusSessionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a focus session (end time, duration, rating)' })
  @ApiResponse({
    status: 200,
    description: 'The focus session has been successfully updated.',
    type: FocusSessionEntity,
  })
  @ApiResponse({ status: 404, description: 'Focus session not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id') id: string,
    @Body() updateFocusSessionDto: UpdateFocusSessionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.focusSessionsService.update(id, updateFocusSessionDto, user.id);
  }
}

