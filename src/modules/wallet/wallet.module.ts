import { Module } from '@nestjs/common';
import { CurrencyClientModule } from '../../shared/clients/currencyExchange/currency.module';
import { LoggerModule } from '../../shared/logger/logger.module';
import { CurrencyValidationPipe } from '../../shared/pipes/currencyValidation.pipe';
import { WalletController } from './api/wallet.controller';
import { WalletService } from './app/services/app-wallet.service';
import { TokenizationService } from './app/services/tokenization.service';
import { WALLET_REPOSITORY_TOKEN } from './domain/wallet.repo';
import { WalletMapper } from './infra/repo/mappers/wallet.mapper';
import { WalletRepositoryImpl } from './infra/repo/postgres/wallet.repo.postgres.impl';
// import { WalletRepositoryImpl } from './infra/repo/os/wallet.repo.os.impl';
// Use this for OS implementation

@Module({
  imports: [LoggerModule, CurrencyClientModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletMapper,
    TokenizationService,
    CurrencyValidationPipe,
    {
      provide: WALLET_REPOSITORY_TOKEN,
      useClass: WalletRepositoryImpl,
    },
  ],
})
export class WalletModule {}
