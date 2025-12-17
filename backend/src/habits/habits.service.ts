import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@flowstate/shared/mailer';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitEntity } from './entities/habit.entity';

@Injectable()
export class HabitsService {
  private readonly streakMilestones = [7, 30, 100];

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async create(createHabitDto: CreateHabitDto, userId: string): Promise<HabitEntity> {
    this.validateSchedule(createHabitDto.schedule);

    if (createHabitDto.goalId) {
      await this.validateGoalAccess(createHabitDto.goalId, userId);
    }

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

    const habit = await this.prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(habit);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.habit.delete({
      where: { id },
    });
  }

  async complete(id: string, userId: string): Promise<HabitEntity> {
    const habit = await this.prisma.habit.findFirst({
      where: { id, userId },
      include: { user: true },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const schedule = habit.schedule as { days: string[]; time?: string };
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (!schedule.days.includes(today)) {
      throw new BadRequestException(`This habit is not scheduled for ${today}`);
    }

    const oldStreak = habit.streakCurrent;
    const newStreak = oldStreak + 1;
    const newBest = Math.max(habit.streakBest, newStreak);

    const updated = await this.prisma.habit.update({
      where: { id },
      data: {
        streakCurrent: newStreak,
        streakBest: newBest,
      },
    });

    await this.checkAndSendStreakMilestoneEmail(
      habit,
      oldStreak,
      newStreak,
      newBest,
      schedule,
    );

    return this.mapToEntity(updated);
  }

  private async checkAndSendStreakMilestoneEmail(
    habit: any,
    oldStreak: number,
    newStreak: number,
    bestStreak: number,
    schedule: { days: string[]; time?: string },
  ): Promise<void> {
    const crossedMilestone = this.streakMilestones.find(
      (milestone) => oldStreak < milestone && newStreak >= milestone,
    );

    if (!crossedMilestone) {
      return;
    }

    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
      const frequencyMap: Record<number, string> = {
        1: 'Daily',
        7: 'Weekly',
        30: 'Monthly',
      };
      const frequency = frequencyMap[schedule.days.length] || `${schedule.days.length} days/week`;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - newStreak);

      await this.mailerService.sendStreakMilestoneEmail(habit.user.email, {
        userName: habit.user.fullName || 'there',
        habitName: habit.name,
        streakDays: newStreak,
        bestStreak,
        frequency,
        startDate: startDate.toLocaleDateString(),
        habitUrl: `${frontendUrl}/habits/${habit.id}`,
        settingsUrl: `${frontendUrl}/settings/notifications`,
      });
    } catch (error) {
      console.error('Failed to send streak milestone email:', error);
    }
  }

  async resetStreak(id: string, userId: string): Promise<HabitEntity> {
    await this.findOne(id, userId);

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
    schedule: unknown;
    streakCurrent: number;
    streakBest: number;
    createdAt: Date;
    updatedAt: Date;
  }): HabitEntity {
    return {
      id: habit.id,
      userId: habit.userId,
      goalId: habit.goalId ?? undefined,
      name: habit.name,
      schedule: habit.schedule,
      streakCurrent: habit.streakCurrent,
      streakBest: habit.streakBest,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }
}

