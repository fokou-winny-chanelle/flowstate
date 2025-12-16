import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
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
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalEntity } from './entities/goal.entity';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({
    status: 201,
    description: 'The goal has been successfully created.',
    type: GoalEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createGoalDto: CreateGoalDto, @CurrentUser() user: { id: string }) {
    return this.goalsService.create(createGoalDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all goals.',
    type: [GoalEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.goalsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal by ID' })
  @ApiResponse({
    status: 200,
    description: 'The goal found.',
    type: GoalEntity,
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  @ApiResponse({
    status: 200,
    description: 'The goal has been successfully updated.',
    type: GoalEntity,
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.update(id, updateGoalDto, user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks for a goal' })
  @ApiResponse({
    status: 200,
    description: 'List of goal tasks.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          isCompleted: { type: 'boolean' },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          priority: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getTasks(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.getTasks(id, user.id);
  }

  @Get(':id/habits')
  @ApiOperation({ summary: 'Get all habits for a goal' })
  @ApiResponse({
    status: 200,
    description: 'List of goal habits.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          schedule: {
            type: 'object',
            properties: {
              days: { type: 'array', items: { type: 'string' } },
              time: { type: 'string', nullable: true },
            },
          },
          streakCurrent: { type: 'number' },
          streakBest: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getHabits(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.getHabits(id, user.id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Manually update goal progress (overrides automatic calculation)' })
  @ApiResponse({
    status: 200,
    description: 'Progress has been updated manually.',
    type: GoalEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid progress value.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.updateProgress(id, body.progress, user.id);
  }

  @Post(':id/recalculate-progress')
  @ApiOperation({ summary: 'Recalculate goal progress automatically based on completed tasks' })
  @ApiResponse({
    status: 200,
    description: 'Progress has been recalculated based on task completion.',
    type: GoalEntity,
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  recalculateProgress(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.recalculateProgress(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiResponse({
    status: 200,
    description: 'The goal has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.remove(id, user.id);
  }
}

