import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { FocusSessionEntity } from './entities/focus-session.entity';

@Injectable()
export class FocusSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createFocusSessionDto: CreateFocusSessionDto,
    userId: string,
  ): Promise<FocusSessionEntity> {
    if (createFocusSessionDto.taskId) {
      await this.validateTaskAccess(createFocusSessionDto.taskId, userId);
    }

    const startTime = createFocusSessionDto.startTime
      ? new Date(createFocusSessionDto.startTime)
      : new Date();

    // @ts-expect-error - Prisma client types are generated at build time
    const session = await this.prisma.focusSession.create({
      data: {
        ...createFocusSessionDto,
        userId,
        startTime,
      },
    });

    return this.mapToEntity(session);
  }

  async findAll(
    userId: string,
    filters?: {
      taskId?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<FocusSessionEntity[]> {
    const where: {
      userId: string;
      taskId?: string;
      startTime?: { gte?: Date; lte?: Date };
    } = {
      userId,
    };

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }
    if (filters?.from || filters?.to) {
      where.startTime = {};
      if (filters.from) {
        where.startTime.gte = filters.from;
      }
      if (filters.to) {
        where.startTime.lte = filters.to;
      }
    }

    // @ts-expect-error - Prisma client types are generated at build time
    const sessions = await this.prisma.focusSession.findMany({
      where,
      orderBy: {
        startTime: 'desc',
      },
    });

    return sessions.map((session) => this.mapToEntity(session));
  }

  async findOne(id: string, userId: string): Promise<FocusSessionEntity> {
    // @ts-expect-error - Prisma client types are generated at build time
    const session = await this.prisma.focusSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException(`Focus session with ID ${id} not found`);
    }

    return this.mapToEntity(session);
  }

  async update(
    id: string,
    updateFocusSessionDto: UpdateFocusSessionDto,
    userId: string,
  ): Promise<FocusSessionEntity> {
    const existingSession = await this.findOne(id, userId);

    const updateData: {
      actualDuration?: number;
      endTime?: Date;
      focusRating?: number;
    } = {};

    if (updateFocusSessionDto.actualDuration !== undefined) {
      updateData.actualDuration = updateFocusSessionDto.actualDuration;
    }

    if (updateFocusSessionDto.endTime) {
      const endTime = new Date(updateFocusSessionDto.endTime);
      const startTime = new Date(existingSession.startTime);
      
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      updateData.endTime = endTime;

      if (!updateFocusSessionDto.actualDuration) {
        const durationMs = endTime.getTime() - startTime.getTime();
        updateData.actualDuration = Math.round(durationMs / 60000);
      }
    }

    if (updateFocusSessionDto.focusRating !== undefined) {
      updateData.focusRating = updateFocusSessionDto.focusRating;
    }

    // @ts-expect-error - Prisma client types are generated at build time
    const updated = await this.prisma.focusSession.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(updated);
  }

  async getStats(userId: string, days: number = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    // @ts-expect-error - Prisma client types are generated at build time
    const sessions = await this.prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte: from,
        },
      },
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration), 0);
    const totalHours = totalMinutes / 60;
    const averageRating =
      sessions.filter((s) => s.focusRating).length > 0
        ? sessions
            .filter((s) => s.focusRating)
            .reduce((sum, s) => sum + (s.focusRating || 0), 0) /
          sessions.filter((s) => s.focusRating).length
        : 0;

    return {
      totalSessions,
      totalMinutes,
      totalHours: Math.round(totalHours * 100) / 100,
      averageRating: Math.round(averageRating * 100) / 100,
      periodDays: days,
    };
  }

  private async validateTaskAccess(taskId: string, userId: string): Promise<void> {
    // @ts-expect-error - Prisma client types are generated at build time
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new ForbiddenException(`Task with ID ${taskId} not found or access denied`);
    }
  }

  private mapToEntity(session: {
    id: string;
    userId: string;
    taskId: string | null;
    plannedDuration: number;
    actualDuration: number | null;
    startTime: Date;
    endTime: Date | null;
    focusRating: number | null;
    createdAt: Date;
  }): FocusSessionEntity {
    return {
      id: session.id,
      userId: session.userId,
      taskId: session.taskId,
      plannedDuration: session.plannedDuration,
      actualDuration: session.actualDuration,
      startTime: session.startTime,
      endTime: session.endTime,
      focusRating: session.focusRating,
      createdAt: session.createdAt,
    };
  }
}

