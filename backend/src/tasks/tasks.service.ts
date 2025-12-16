import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskEntity> {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        isCompleted: createTaskDto.isCompleted ?? false,
      },
    });

    return this.mapToEntity(task);
  }

  /**
   * Find all tasks for a user
   */
  async findAll(userId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks.map((task) => this.mapToEntity(task));
  }

  /**
   * Find a single task by ID
   */
  async findOne(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.mapToEntity(task);
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskEntity> {
    // Verify task exists and belongs to user
    await this.findOne(id, userId);

    const task = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });

    return this.mapToEntity(task);
  }

  /**
   * Delete a task (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    // Verify task exists and belongs to user
    await this.findOne(id, userId);

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Map Prisma task model to TaskEntity
   */
  private mapToEntity(task: {
    id: string;
    title: string;
    description: string | null;
    isCompleted: boolean;
    dueDate: Date | null;
    priority: number | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    projectId: string | null;
    estimatedDuration: number | null;
    energyLevel: string | null;
  }): TaskEntity {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate,
      priority: task.priority,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      projectId: task.projectId,
      estimatedDuration: task.estimatedDuration,
      energyLevel: task.energyLevel as 'low' | 'medium' | 'high' | undefined,
    };
  }
}

