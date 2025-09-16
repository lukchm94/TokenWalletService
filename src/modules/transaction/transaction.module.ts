import { Module } from '@nestjs/common';
import { LoggerModule } from '../../shared/logger/logger.module';
import { RabbitModule } from '../../shared/rabbitMQ/rabbit.module';
import { GatewayModule } from '../gateway/gateway.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionRepresentationMapper } from './api/representationMapper';
import { TransactionController } from './api/transaction.controller';
import { CancelTransactionUseCase } from './app/cancel-transaction-use-case/cancel-transaction.use-case';
import { CompleteTransactionUseCase } from './app/complete-transaction-use-case/complete-transaction.use-case';
import { CreateTransactionUseCase } from './app/create-transaction-use-case/create-transaction.use-case';
import { SendCompleteTransactionEventUseCase } from './app/send-complete-trx-event.use-case/send-complete-trx-event.use-case';
import { UpdateTransactionFromWebhookUseCase } from './app/update-transaction-from-webhook-use-case/update-transaction-from-webhook.use-case';
import { TransactionService } from './domain/services/transaction.service';
import { TRANSACTION_REPOSITORY_TOKEN } from './domain/transaction.repo';
import { TransactionRepoImpl } from './infra/repo/transaction.postgres.repo.impl';

@Module({
  imports: [LoggerModule, WalletModule, GatewayModule, RabbitModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    CreateTransactionUseCase,
    CompleteTransactionUseCase,
    CancelTransactionUseCase,
    TransactionRepresentationMapper,
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: TransactionRepoImpl,
    },
    UpdateTransactionFromWebhookUseCase,
    SendCompleteTransactionEventUseCase,
  ],
  exports: [
    TransactionService,
    CreateTransactionUseCase,
    CompleteTransactionUseCase,
    TransactionRepresentationMapper,
    CancelTransactionUseCase,
    UpdateTransactionFromWebhookUseCase,
    SendCompleteTransactionEventUseCase,
  ],
})
export class TransactionModule {}
