import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParseInputDto {
  @ApiProperty({
    example: 'call mom tomorrow 3pm #family high priority',
    description: 'Natural language input to parse',
  })
  @IsString()
  @IsNotEmpty()
  input: string;
}

export interface ParsedTaskData {
  title: string;
  description?: string;
  dueDate?: Date;
  tags?: string[];
  priority?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  projectId?: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  estimatedDuration?: number;
  rawInput: string;
}

