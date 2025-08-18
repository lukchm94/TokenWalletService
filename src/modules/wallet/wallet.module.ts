import { Module } from '@nestjs/common';
// import { AppLoggerService } from '../../shared/logger/app-logger.service';
import { LoggerModule } from '../../shared/logger/logger.module';
import { WalletController } from './api/wallet.controller';
import { WalletService } from './app/app-wallet.service';
import { WALLET_REPOSITORY_TOKEN } from './domain/wallet.repo';
// import { WalletRepositoryImpl } from './infra/repo/os/wallet.repo.os.impl';

import { WalletMapper } from './infra/repo/mappers/wallet.mapper';
import { WalletRepositoryImpl } from './infra/repo/postgres/wallet.repo.postgres.impl';

@Module({
  imports: [LoggerModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletMapper,
    {
      provide: WALLET_REPOSITORY_TOKEN,
      useClass: WalletRepositoryImpl,
    },
  ],
})
export class WalletModule {}
