import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { ApiRoutes } from 'src/shared/router/routes';

@Controller(ApiRoutes.HEALTH)
export class HealthController {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(private readonly logger: AppLoggerService) {}
  @Get()
  checkHealth(): { status: string } {
    this.logger.log(this.logPrefix, 'Health check: OK');
    return { status: 'ok' };
  }
}
