import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { HealthController } from './interfaces/controllers/health.controller';

@Module({
  imports: [LoggerModule],
  controllers: [HealthController],
})
export class HealthModule {}
