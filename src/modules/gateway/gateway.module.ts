import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { GatewayService } from './domain/gateway.service';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
