import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { GoalsService } from '../goals/goals.service';
import { NlpService } from '../nlp/nlp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatsDto } from './dto/task-stats.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nlpService: NlpService,
    @Inject(forwardRef(() => GoalsService))
    private readonly goalsService: GoalsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskEntity> {
    if (createTaskDto.projectId) {
      await this.validateProjectAccess(createTaskDto.projectId, userId);
    }

    if (createTaskDto.goalId) {
      await this.validateGoalAccess(createTaskDto.goalId, userId);
    }

    const taskData: {
      title: string;
      description?: string;
      isCompleted: boolean;
      dueDate?: Date;
      priority?: number;
      tags?: string[];
      projectId?: string;
      goalId?: string;
      estimatedDuration?: number;
      energyLevel?: string;
      userId: string;
    } = {
      title: createTaskDto.title,
      userId,
      isCompleted: createTaskDto.isCompleted ?? false,
    };

    if (createTaskDto.description) {
      taskData.description = createTaskDto.description;
    }
    if (createTaskDto.dueDate) {
      taskData.dueDate = new Date(createTaskDto.dueDate);
    }
    if (createTaskDto.priority !== undefined) {
      taskData.priority = createTaskDto.priority;
    }
    if (createTaskDto.tags) {
      taskData.tags = createTaskDto.tags;
    }
    if (createTaskDto.projectId) {
      taskData.projectId = createTaskDto.projectId;
    }
    if (createTaskDto.goalId) {
      taskData.goalId = createTaskDto.goalId;
    }
    if (createTaskDto.estimatedDuration) {
      taskData.estimatedDuration = createTaskDto.estimatedDuration;
    }
    if (createTaskDto.energyLevel) {
      taskData.energyLevel = createTaskDto.energyLevel;
    }

    const task = await this.prisma.task.create({
      data: taskData,
    });

    if (taskData.goalId) {
      await this.goalsService.calculateProgress(taskData.goalId).catch(() => {
        // Ignore errors if goal doesn't exist or calculation fails
      });
    }

    return this.mapToEntity(task);
  }

  async createFromNlp(input: string, userId: string): Promise<TaskEntity> {
    const parsed = this.nlpService.parseTaskInput(input);

    const taskData: {
      title: string;
      description?: string;
      dueDate?: Date;
      tags?: string[];
      priority?: number;
      energyLevel?: string;
      estimatedDuration?: number;
      rawNlpInput: string;
      metadata?: { recurrence?: { pattern: string; interval?: number; daysOfWeek?: number[]; endDate?: Date } };
      goalId?: string;
      userId: string;
    } = {
      title: parsed.title,
      userId,
      rawNlpInput: input,
    };

    if (parsed.description) {
      taskData.description = parsed.description;
    }
    if (parsed.dueDate) {
      taskData.dueDate = parsed.dueDate;
    }
    if (parsed.tags && parsed.tags.length > 0) {
      taskData.tags = parsed.tags;
    }
    if (parsed.priority) {
      taskData.priority = parsed.priority;
    }
    if (parsed.energyLevel) {
      taskData.energyLevel = parsed.energyLevel;
    }
    if (parsed.estimatedDuration) {
      taskData.estimatedDuration = parsed.estimatedDuration;
    }
    if (parsed.recurrence) {
      taskData.metadata = { recurrence: parsed.recurrence };
    }

    const task = await this.prisma.task.create({
      data: taskData,
    });

    if (taskData.goalId) {
      await this.goalsService.calculateProgress(taskData.goalId).catch(() => undefined);
    }

    return this.mapToEntity(task);
  }

  async findAll(
    userId: string,
    filters?: {
      isCompleted?: boolean;
      projectId?: string;
      goalId?: string;
      tags?: string[];
      dueDateFrom?: Date;
      dueDateTo?: Date;
      priority?: number;
      energyLevel?: string;
    },
  ): Promise<TaskEntity[]> {
    const where: {
      userId: string;
      deletedAt: null;
      isCompleted?: boolean;
      projectId?: string;
      goalId?: string;
      tags?: { hasSome: string[] };
      dueDate?: { gte?: Date; lte?: Date };
      priority?: number;
      energyLevel?: string;
    } = {
      userId,
      deletedAt: null,
    };

    if (filters?.isCompleted !== undefined) {
      where.isCompleted = filters.isCompleted;
    }
    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters?.goalId) {
      where.goalId = filters.goalId;
    }
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters?.dueDateFrom || filters?.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = filters.dueDateTo;
      }
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.energyLevel) {
      where.energyLevel = filters.energyLevel;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tasks.map((task) => this.mapToEntity(task));
  }

  async findToday(userId: string): Promise<TaskEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        isCompleted: false,
        OR: [
          {
            dueDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            dueDate: null,
          },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return tasks.map((task) => this.mapToEntity(task));
  }

  async findUpcoming(userId: string, days = 7): Promise<TaskEntity[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        isCompleted: false,
        dueDate: {
          gte: now,
          lte: future,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tasks.map((task) => this.mapToEntity(task));
  }

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

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskEntity> {
    await this.findOne(id, userId);

    if (updateTaskDto.projectId) {
      await this.validateProjectAccess(updateTaskDto.projectId, userId);
    }

    if (updateTaskDto.goalId) {
      await this.validateGoalAccess(updateTaskDto.goalId, userId);
    }

    const updateData: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      dueDate?: Date;
      priority?: number;
      tags?: string[];
      projectId?: string;
      goalId?: string;
      estimatedDuration?: number;
      energyLevel?: string;
    } = {};

    if (updateTaskDto.title !== undefined) {
      updateData.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      updateData.description = updateTaskDto.description;
    }
    if (updateTaskDto.isCompleted !== undefined) {
      updateData.isCompleted = updateTaskDto.isCompleted;
    }
    if (updateTaskDto.dueDate !== undefined) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }
    if (updateTaskDto.priority !== undefined) {
      updateData.priority = updateTaskDto.priority;
    }
    if (updateTaskDto.tags !== undefined) {
      updateData.tags = updateTaskDto.tags;
    }
    if (updateTaskDto.projectId !== undefined) {
      updateData.projectId = updateTaskDto.projectId;
    }
    if (updateTaskDto.goalId !== undefined) {
      updateData.goalId = updateTaskDto.goalId;
    }
    if (updateTaskDto.estimatedDuration !== undefined) {
      updateData.estimatedDuration = updateTaskDto.estimatedDuration;
    }
    if (updateTaskDto.energyLevel !== undefined) {
      updateData.energyLevel = updateTaskDto.energyLevel;
    }

    const oldTask = await this.prisma.task.findUnique({
      where: { id },
    });

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    const goalIdToUpdate = updateData.goalId || oldTask?.goalId;
    if (goalIdToUpdate) {
      await this.goalsService.calculateProgress(goalIdToUpdate).catch(() => undefined);
    }

    return this.mapToEntity(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (task.goalId) {
      await this.goalsService.calculateProgress(task.goalId).catch(() => undefined);
    }
  }

  async complete(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.findOne(id, userId);

    const updated = await this.prisma.task.update({
      where: { id },
      data: { isCompleted: true },
    });

    if (task.goalId) {
      await this.goalsService.calculateProgress(task.goalId).catch(() => undefined);
    }

    return this.mapToEntity(updated);
  }

  async snooze(id: string, userId: string, until: Date): Promise<TaskEntity> {
    await this.findOne(id, userId);

    if (until <= new Date()) {
      throw new BadRequestException('Snooze date must be in the future');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { dueDate: until },
    });

    return this.mapToEntity(updated);
  }

  private async validateProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException(`Project with ID ${projectId} not found or access denied`);
    }
  }

  private async validateGoalAccess(goalId: string, userId: string): Promise<void> {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new ForbiddenException(`Goal with ID ${goalId} not found or access denied`);
    }
  }

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
    goalId: string | null;
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
      goalId: task.goalId,
      estimatedDuration: task.estimatedDuration,
      energyLevel: task.energyLevel as 'low' | 'medium' | 'high' | undefined,
    };
  }

  async getStats(userId: string): Promise<TaskStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      total,
      completed,
      active,
      overdue,
      todayTasks,
      upcoming,
      noDate,
      highPriority,
      allTasks,
    ] = await Promise.all([
      this.prisma.task.count({
        where: { userId, deletedAt: null },
      }),
      this.prisma.task.count({
        where: { userId, deletedAt: null, isCompleted: true },
      }),
      this.prisma.task.count({
        where: { userId, deletedAt: null, isCompleted: false },
      }),
      this.prisma.task.count({
        where: {
          userId,
          deletedAt: null,
          isCompleted: false,
          dueDate: { lt: today },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          deletedAt: null,
          isCompleted: false,
          OR: [
            { dueDate: { gte: today, lt: tomorrow } },
            { dueDate: null },
          ],
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          deletedAt: null,
          isCompleted: false,
          dueDate: { gte: tomorrow },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          deletedAt: null,
          isCompleted: false,
          dueDate: null,
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          deletedAt: null,
          isCompleted: false,
          priority: 1,
        },
      }),
      this.prisma.task.findMany({
        where: { userId, deletedAt: null },
        select: { priority: true, energyLevel: true, isCompleted: true },
      }),
    ]);

    const byPriority: { [key: number]: number } = {};
    const byEnergyLevel = { low: 0, medium: 0, high: 0 };

    allTasks.forEach((task) => {
      if (task.priority !== null) {
        byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      }
      if (task.energyLevel) {
        byEnergyLevel[task.energyLevel as keyof typeof byEnergyLevel]++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      overdue,
      today: todayTasks,
      upcoming,
      noDate,
      highPriority,
      byPriority,
      byEnergyLevel,
      completionRate,
    };
  }
}

