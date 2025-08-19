import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CurrencyClientModule } from './shared/clients/currencyExchange/currency.module';
import { PrismaModule } from './shared/database/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [
    HealthModule,
    LoggerModule,
    WalletModule,
    PrismaModule,
    CurrencyClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
