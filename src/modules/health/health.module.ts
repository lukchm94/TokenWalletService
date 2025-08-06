import { Module } from '@nestjs/common';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { HealthController } from './interfaces/controllers/health.controller';

@Module({
  providers: [AppLoggerService],
  controllers: [HealthController],
})
export class HealthModule {}
