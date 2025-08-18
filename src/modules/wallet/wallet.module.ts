import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { WalletController } from './api/wallet.controller';
import { WalletService } from './app/services/app-wallet.service';
import { TokenizationService } from './app/services/tokenization.service';
import { WALLET_REPOSITORY_TOKEN } from './domain/wallet.repo';
import { WalletMapper } from './infra/repo/mappers/wallet.mapper';
import { WalletRepositoryImpl } from './infra/repo/postgres/wallet.repo.postgres.impl';
// import { WalletRepositoryImpl } from './infra/repo/os/wallet.repo.os.impl';

@Module({
  imports: [LoggerModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletMapper,
    TokenizationService,
    {
      provide: WALLET_REPOSITORY_TOKEN,
      useClass: WalletRepositoryImpl,
    },
  ],
})
export class WalletModule {}
