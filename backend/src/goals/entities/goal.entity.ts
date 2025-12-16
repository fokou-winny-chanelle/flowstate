import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoalEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  projectId?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  targetDate?: Date | string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  createdAt: Date | string;

  @ApiProperty()
  updatedAt: Date | string;
}

