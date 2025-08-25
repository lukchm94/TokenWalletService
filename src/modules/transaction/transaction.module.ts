import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionController } from './api/transaction.controller';
import { CompleteTransactionUseCase } from './app/complete-transaction-use-case/complete-transaction.use-case';
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
    CompleteTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: TransactionRepoImpl,
    },
  ],
  exports: [
    TransactionService,
    CreateTransactionUseCase,
    CompleteTransactionUseCase,
  ],
})
export class TransactionModule {}
