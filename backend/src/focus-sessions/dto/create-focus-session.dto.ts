import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateFocusSessionDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiProperty({ example: 25, description: 'Planned duration in minutes' })
  @IsInt()
  @Min(1)
  plannedDuration: number;

  @ApiPropertyOptional({ example: '2024-12-20T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  startTime?: string;
}

