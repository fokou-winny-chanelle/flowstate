import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskFromNlpDto } from './dto/create-task-from-nlp.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { SnoozeTaskDto } from './dto/snooze-task.dto';
import { TaskStatsDto } from './dto/task-stats.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: { id: string }) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Post('from-nlp')
  @ApiOperation({ summary: 'Create a task from natural language input' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created from NLP input.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createFromNlp(@Body() dto: CreateTaskFromNlpDto, @CurrentUser() user: { id: string }) {
    return this.tasksService.createFromNlp(dto.input, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all tasks.',
    type: [TaskEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('isCompleted') isCompleted?: string,
    @Query('projectId') projectId?: string,
    @Query('goalId') goalId?: string,
    @Query('tags') tags?: string,
    @Query('priority') priority?: string,
    @Query('energyLevel') energyLevel?: string,
  ) {
    const filters: {
      isCompleted?: boolean;
      projectId?: string;
      goalId?: string;
      tags?: string[];
      priority?: number;
      energyLevel?: string;
    } = {};

    if (isCompleted !== undefined) {
      filters.isCompleted = isCompleted === 'true';
    }
    if (projectId) {
      filters.projectId = projectId;
    }
    if (goalId) {
      filters.goalId = goalId;
    }
    if (tags) {
      filters.tags = tags.split(',');
    }
    if (priority) {
      filters.priority = parseInt(priority, 10);
    }
    if (energyLevel) {
      filters.energyLevel = energyLevel;
    }

    return this.tasksService.findAll(user.id, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Task statistics.',
    type: TaskStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getStats(@CurrentUser() user: { id: string }): Promise<TaskStatsDto> {
    return this.tasksService.getStats(user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of today\'s tasks.',
    type: [TaskEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findToday(@CurrentUser() user: { id: string }) {
    return this.tasksService.findToday(user.id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming tasks.',
    type: [TaskEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findUpcoming(@CurrentUser() user: { id: string }, @Query('days') days?: string) {
    const daysCount = days ? parseInt(days, 10) : 7;
    return this.tasksService.findUpcoming(user.id, daysCount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'The task found.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiResponse({
    status: 200,
    description: 'The task has been marked as completed.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  complete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tasksService.complete(id, user.id);
  }

  @Post(':id/snooze')
  @ApiOperation({ summary: 'Snooze a task until a specific date' })
  @ApiResponse({
    status: 200,
    description: 'The task has been snoozed.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid snooze date (must be in the future).' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  snooze(
    @Param('id') id: string,
    @Body() snoozeTaskDto: SnoozeTaskDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.snooze(id, user.id, new Date(snoozeTaskDto.until));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tasksService.remove(id, user.id);
  }
}

