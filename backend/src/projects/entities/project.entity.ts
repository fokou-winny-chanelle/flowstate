import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 'Website Redesign' })
  name: string;

  @ApiPropertyOptional({ example: 'Complete redesign of company website' })
  description?: string;

  @ApiProperty({ example: '#14A800', default: '#14A800' })
  color: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  deadline?: Date | string;

  @ApiProperty({ example: 0.0, minimum: 0, maximum: 100 })
  progress: number;

  @ApiProperty()
  createdAt: Date | string;

  @ApiProperty()
  updatedAt: Date | string;

  @ApiPropertyOptional()
  deletedAt?: Date | string;
}

