import { Module } from '@nestjs/common';
import { MailerModule } from '@flowstate/shared/mailer';
import { PrismaModule } from '../prisma/prisma.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}

