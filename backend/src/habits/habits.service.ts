import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitEntity } from './entities/habit.entity';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHabitDto: CreateHabitDto, userId: string): Promise<HabitEntity> {
    this.validateSchedule(createHabitDto.schedule);

    if (createHabitDto.goalId) {
      await this.validateGoalAccess(createHabitDto.goalId, userId);
    }

    // @ts-expect-error - Prisma client types are generated at build time
    const habit = await this.prisma.habit.create({
      data: {
        name: createHabitDto.name,
        userId,
        goalId: createHabitDto.goalId,
        schedule: createHabitDto.schedule as { days: string[]; time?: string },
        streakCurrent: 0,
        streakBest: 0,
      },
    });

    return this.mapToEntity(habit);
  }

  async findAll(userId: string): Promise<HabitEntity[]> {
    // @ts-expect-error - Prisma client types are generated at build time
    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return habits.map((habit) => this.mapToEntity(habit));
  }

  async findOne(id: string, userId: string): Promise<HabitEntity> {
    // @ts-expect-error - Prisma client types are generated at build time
    const habit = await this.prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return this.mapToEntity(habit);
  }

  async update(
    id: string,
    updateHabitDto: UpdateHabitDto,
    userId: string,
  ): Promise<HabitEntity> {
    await this.findOne(id, userId);

    if (updateHabitDto.schedule) {
      this.validateSchedule(updateHabitDto.schedule);
    }

    if (updateHabitDto.goalId) {
      await this.validateGoalAccess(updateHabitDto.goalId, userId);
    }

    const updateData: {
      name?: string;
      schedule?: { days: string[]; time?: string };
      goalId?: string;
    } = {};

    if (updateHabitDto.name !== undefined) {
      updateData.name = updateHabitDto.name;
    }
    if (updateHabitDto.schedule) {
      updateData.schedule = updateHabitDto.schedule;
    }
    if (updateHabitDto.goalId !== undefined) {
      updateData.goalId = updateHabitDto.goalId;
    }

    // @ts-expect-error - Prisma client types are generated at build time
    const habit = await this.prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(habit);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    // @ts-expect-error - Prisma client types are generated at build time
    await this.prisma.habit.delete({
      where: { id },
    });
  }

  async complete(id: string, userId: string): Promise<HabitEntity> {
    const habit = await this.findOne(id, userId);

    const schedule = habit.schedule as { days: string[]; time?: string };
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (!schedule.days.includes(today)) {
      throw new BadRequestException(`This habit is not scheduled for ${today}`);
    }

    const newStreak = habit.streakCurrent + 1;
    const newBest = Math.max(habit.streakBest, newStreak);

    // @ts-expect-error - Prisma client types are generated at build time
    const updated = await this.prisma.habit.update({
      where: { id },
      data: {
        streakCurrent: newStreak,
        streakBest: newBest,
      },
    });

    return this.mapToEntity(updated);
  }

  async resetStreak(id: string, userId: string): Promise<HabitEntity> {
    await this.findOne(id, userId);

    // @ts-expect-error - Prisma client types are generated at build time
    const updated = await this.prisma.habit.update({
      where: { id },
      data: {
        streakCurrent: 0,
      },
    });

    return this.mapToEntity(updated);
  }

  private validateSchedule(schedule: { days: string[]; time?: string }): void {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!schedule.days || schedule.days.length === 0) {
      throw new BadRequestException('Schedule must include at least one day');
    }

    for (const day of schedule.days) {
      if (!validDays.includes(day.toLowerCase())) {
        throw new BadRequestException(`Invalid day: ${day}. Valid days are: ${validDays.join(', ')}`);
      }
    }

    if (schedule.time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(schedule.time)) {
        throw new BadRequestException('Time must be in HH:MM format (24-hour)');
      }
    }
  }

  private async validateGoalAccess(goalId: string, userId: string): Promise<void> {
    // @ts-expect-error - Prisma client types are generated at build time
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

  private mapToEntity(habit: {
    id: string;
    userId: string;
    goalId: string | null;
    name: string;
    schedule: { days: string[]; time?: string };
    streakCurrent: number;
    streakBest: number;
    createdAt: Date;
    updatedAt: Date;
  }): HabitEntity {
    return {
      id: habit.id,
      userId: habit.userId,
      goalId: habit.goalId,
      name: habit.name,
      schedule: habit.schedule as { days: string[]; time?: string },
      streakCurrent: habit.streakCurrent,
      streakBest: habit.streakBest,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }
}

