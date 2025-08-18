import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PrismaModule } from './shared/database/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';
@Module({
  imports: [HealthModule, LoggerModule, WalletModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
