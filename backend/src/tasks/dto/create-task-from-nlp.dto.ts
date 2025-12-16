import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskFromNlpDto {
  @ApiProperty({
    description: 'Natural language input to parse into a task',
    example: 'call mom tomorrow 3pm #family high priority',
  })
  @IsString()
  @IsNotEmpty()
  input: string;
}

