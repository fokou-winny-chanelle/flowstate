import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export enum EnergyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title/name',
    example: 'Finish quarterly report',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Optional detailed description',
    example: 'Include Q3 metrics and projections',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the task is completed',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Due date in ISO format',
    example: '2024-12-20T15:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level (1-5, where 5 is highest)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['#work', '#urgent'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Project identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Goal identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  goalId?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 120,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'Energy level required',
    enum: EnergyLevel,
    example: EnergyLevel.HIGH,
  })
  @IsEnum(EnergyLevel)
  @IsOptional()
  energyLevel?: EnergyLevel;
}


