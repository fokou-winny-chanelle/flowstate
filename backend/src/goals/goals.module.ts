import { Module, forwardRef } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [PrismaModule, EmailQueueModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}

