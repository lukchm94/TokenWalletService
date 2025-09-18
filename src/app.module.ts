import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { RabbitModule } from './modules/rabbitMQ/rabbit.module';
import { TransactionModule } from './modules/transaction/transaction.module';
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
    TransactionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitModule,
  ],
})
export class AppModule {}
