import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  IsEnum,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({ example: 'Morning Workout' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: { days: ['monday', 'wednesday', 'friday'], time: '07:00' },
    description: 'Schedule object with days and optional time',
  })
  @IsObject()
  @IsNotEmpty()
  schedule: {
    days: string[];
    time?: string;
  };

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsOptional()
  goalId?: string;
}

