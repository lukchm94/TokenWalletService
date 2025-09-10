import { Module } from '@nestjs/common';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { LoggerModule } from 'src/shared/logger/logger.module';
import { HealthController } from './interfaces/controllers/health.controller';

@Module({
  imports: [LoggerModule],
  providers: [AppLoggerService],
  controllers: [HealthController],
})
export class HealthModule {}
