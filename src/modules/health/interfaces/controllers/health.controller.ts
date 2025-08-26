import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { ApiRoutes } from '../../../../shared/router/routes';

@Controller(ApiRoutes.HEALTH)
export class HealthController {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly prisma: PrismaService,
  ) {}
  @Get()
  checkHealth(): { status: string } {
    this.logger.log(this.logPrefix, 'Health check: OK');
    return { status: 'ok' };
  }

  @Get('db')
  async checkDb(): Promise<{ db: string; message: string }> {
    try {
      this.logger.log(this.logPrefix, 'Checking DB connection');
      await this.prisma.$queryRaw`SELECT 1`;
      return { db: 'ok', message: 'DB connection ok' };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return { db: 'error', message: err.message as string };
    }
  }
}
