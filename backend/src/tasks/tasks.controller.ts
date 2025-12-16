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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all tasks.',
    type: [TaskEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.tasksService.findAll(user.id);
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

