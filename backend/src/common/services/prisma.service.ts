import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async validateConnection() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new BadRequestException('No se pudo conectar a la base de datos');
    }
  }
}
