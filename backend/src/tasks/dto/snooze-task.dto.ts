import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class SnoozeTaskDto {
  @ApiProperty({
    description: 'Date and time to snooze the task until',
    example: '2024-12-21T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  until: string;
}

