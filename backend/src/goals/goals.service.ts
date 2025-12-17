import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalEntity } from './entities/goal.entity';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto, userId: string): Promise<GoalEntity> {
    if (createGoalDto.projectId) {
      await this.validateProjectAccess(createGoalDto.projectId, userId);
    }

    const goal = await this.prisma.goal.create({
      data: {
        title: createGoalDto.title,
        type: createGoalDto.type,
        userId,
        progress: createGoalDto.progress ?? 0.0,
        targetDate: createGoalDto.targetDate ? new Date(createGoalDto.targetDate) : null,
        ...(createGoalDto.projectId && { projectId: createGoalDto.projectId }),
      },
    });

    return this.mapToEntity(goal);
  }

  async findAll(userId: string): Promise<GoalEntity[]> {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return goals.map((goal) => this.mapToEntity(goal));
  }

  async findOne(id: string, userId: string): Promise<GoalEntity> {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return this.mapToEntity(goal);
  }

  async update(
    id: string,
    updateGoalDto: UpdateGoalDto,
    userId: string,
  ): Promise<GoalEntity> {
    await this.findOne(id, userId);

    if (updateGoalDto.projectId) {
      await this.validateProjectAccess(updateGoalDto.projectId, userId);
    }

    const updateData: {
      title?: string;
      type?: string;
      targetDate?: Date;
      projectId?: string;
      progress?: number;
    } = {};

    if (updateGoalDto.title !== undefined) {
      updateData.title = updateGoalDto.title;
    }
    if (updateGoalDto.type !== undefined) {
      updateData.type = updateGoalDto.type;
    }
    if (updateGoalDto.targetDate !== undefined) {
      updateData.targetDate = new Date(updateGoalDto.targetDate);
    }
    if (updateGoalDto.projectId !== undefined) {
      updateData.projectId = updateGoalDto.projectId;
    }
    if (updateGoalDto.progress !== undefined) {
      updateData.progress = updateGoalDto.progress;
    }

    const goal = await this.prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(goal);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.goal.delete({
      where: { id },
    });
  }

  async calculateProgress(goalId: string): Promise<number> {
    const tasks = await this.prisma.task.findMany({
      where: {
        goalId,
        deletedAt: null,
      },
    });

    if (tasks.length === 0) {
      return 0;
    }

    const completed = tasks.filter((t) => t.isCompleted).length;
    const progress = Math.round((completed / tasks.length) * 100 * 100) / 100;

    await this.prisma.goal.update({
      where: { id: goalId },
      data: { progress },
    });

    return progress;
  }

  async updateProgress(
    id: string,
    progress: number,
    userId: string,
  ): Promise<GoalEntity> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    await this.findOne(id, userId);

    const goal = await this.prisma.goal.update({
      where: { id },
      data: { progress },
    });

    return this.mapToEntity(goal);
  }

  async recalculateProgress(goalId: string, userId: string): Promise<GoalEntity> {
    await this.findOne(goalId, userId);
    await this.calculateProgress(goalId);

    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    return this.mapToEntity(goal);
  }

  async getTasks(goalId: string, userId: string) {
    await this.findOne(goalId, userId);

    const tasks = await this.prisma.task.findMany({
      where: {
        goalId,
        deletedAt: null,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate,
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  async getHabits(goalId: string, userId: string) {
    await this.findOne(goalId, userId);

    const habits = await this.prisma.habit.findMany({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      schedule: habit.schedule,
      streakCurrent: habit.streakCurrent,
      streakBest: habit.streakBest,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    }));
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

  private mapToEntity(goal: {
    id: string;
    userId: string;
    projectId: string | null;
    title: string;
    type: string;
    targetDate: Date | null;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
  }): GoalEntity {
    return {
      id: goal.id,
      userId: goal.userId,
      projectId: goal.projectId,
      title: goal.title,
      type: goal.type,
      targetDate: goal.targetDate,
      progress: goal.progress,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}

