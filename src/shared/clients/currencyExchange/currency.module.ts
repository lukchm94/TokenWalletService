import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger/logger.module';
import { CurrencyClientService } from './services/currency.service';

@Module({
  imports: [LoggerModule, HttpModule],
  providers: [CurrencyClientService],
  exports: [CurrencyClientService],
})
export class CurrencyClientModule {}
