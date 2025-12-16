import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Prisma client is generated - types will be available after running `npx prisma generate`
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - PrismaClient is generated at build time
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    // In Prisma 7, connection is automatic, but we can still call connect explicitly
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - $connect is available on PrismaClient
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.$connect();
    } catch (error) {
      // Connection might already be established
      console.warn('Prisma connection warning:', error);
    }
  }

  async onModuleDestroy() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - $disconnect is available on PrismaClient
    await this.$disconnect();
  }
}

