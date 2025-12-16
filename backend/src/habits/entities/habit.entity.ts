import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HabitEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  goalId?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  schedule: {
    days: string[];
    time?: string;
  };

  @ApiProperty()
  streakCurrent: number;

  @ApiProperty()
  streakBest: number;

  @ApiProperty()
  createdAt: Date | string;

  @ApiProperty()
  updatedAt: Date | string;
}

