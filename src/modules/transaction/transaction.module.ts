import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionController } from './api/transaction.controller';
import { CreateTransactionUseCase } from './app/create-transaction-use-case/create-transaction.use-case';
import { TransactionService } from './app/services/transaction.service';
import { TRANSACTION_REPOSITORY_TOKEN } from './domain/transaction.repo';
import { TransactionRepoImpl } from './infra/repo/transaction.postgres.repo.impl';

@Module({
  imports: [LoggerModule, WalletModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    CreateTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: TransactionRepoImpl,
    },
  ],
  exports: [TransactionService, CreateTransactionUseCase],
})
export class TransactionModule {}
