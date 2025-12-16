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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitEntity } from './entities/habit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('habits')
@Controller('habits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({
    status: 201,
    description: 'The habit has been successfully created.',
    type: HabitEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createHabitDto: CreateHabitDto, @CurrentUser() user: { id: string }) {
    return this.habitsService.create(createHabitDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all habits for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all habits.',
    type: [HabitEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.habitsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a habit by ID' })
  @ApiResponse({
    status: 200,
    description: 'The habit found.',
    type: HabitEntity,
  })
  @ApiResponse({ status: 404, description: 'Habit not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({
    status: 200,
    description: 'The habit has been successfully updated.',
    type: HabitEntity,
  })
  @ApiResponse({ status: 404, description: 'Habit not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.habitsService.update(id, updateHabitDto, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark habit as completed for today' })
  @ApiResponse({
    status: 200,
    description: 'Habit has been marked as completed.',
    type: HabitEntity,
  })
  @ApiResponse({ status: 404, description: 'Habit not found.' })
  complete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.complete(id, user.id);
  }

  @Post(':id/reset-streak')
  @ApiOperation({ summary: 'Reset habit streak' })
  @ApiResponse({
    status: 200,
    description: 'Streak has been reset.',
    type: HabitEntity,
  })
  @ApiResponse({ status: 404, description: 'Habit not found.' })
  resetStreak(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.resetStreak(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a habit' })
  @ApiResponse({
    status: 200,
    description: 'The habit has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Habit not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.remove(id, user.id);
  }
}

