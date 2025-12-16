import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FocusSessionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  taskId?: string;

  @ApiProperty()
  plannedDuration: number;

  @ApiPropertyOptional()
  actualDuration?: number;

  @ApiProperty()
  startTime: Date | string;

  @ApiPropertyOptional()
  endTime?: Date | string;

  @ApiPropertyOptional()
  focusRating?: number;

  @ApiProperty()
  createdAt: Date | string;
}

