import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NlpModule } from '../nlp/nlp.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [PrismaModule, NlpModule, forwardRef(() => GoalsModule)],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}


