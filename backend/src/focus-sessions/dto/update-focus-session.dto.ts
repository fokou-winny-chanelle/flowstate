import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class UpdateFocusSessionDto {
  @ApiPropertyOptional({ example: 30, description: 'Actual duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  actualDuration?: number;

  @ApiPropertyOptional({ example: '2024-12-20T10:30:00Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ example: 4, description: 'Focus rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  focusRating?: number;
}

