import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletService } from '../../../../modules/wallet/app/services/app-wallet.service';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionRabbitService } from '../../../../shared/rabbitMQ/services/transaction.rabbit.service';
import { TransactionEvent } from '../../../../shared/rabbitMQ/services/transaction.request.event.input';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { TransactionService } from '../../domain/services/transaction.service';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class SendCompleteTransactionEventUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly appLogger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly rabbitService: TransactionRabbitService,
    private readonly walletService: WalletService,
  ) {
    this.appLogger.log(this.logPrefix, `Object initialized.`);
  }

  /**
   * This TypeScript function asynchronously processes a transaction by updating its status and sending
   * a request using RabbitMQ.
   * @param {number} transactionId - The `transactionId` parameter is a unique identifier for a
   * specific transaction. It is used to retrieve the transaction details from the transaction service,
   * check the status of the transaction, and update the status of the transaction to
   * `TransactionStatusEnum.GATEWAY` once certain conditions are met in the `run
   * @returns The `run` method is returning a `TransactionEvent` object.
   */
  public async run(transactionId: number): Promise<TransactionEvent> {
    const transaction = await this.transactionService.getById(transactionId);
    this.appLogger.debug(
      this.logPrefix,
      `Found transaction: ${JSON.stringify(transaction, jsonStringifyReplacer)}`,
    );
    if (transaction.status !== TransactionStatusEnum.PENDING) {
      this.processNotPendingTransaction(transaction);
    }
    const sendEvent = await this.checkWalletBalance(transaction);

    if (!sendEvent) {
      return this.returnFailedEvent(transaction);
    }

    const eventSent = this.rabbitService.sendTrxRequest(transaction);
    const updatedTransaction = await this.transactionService.update({
      transactionId: transaction.id,
      status: TransactionStatusEnum.GATEWAY,
    });
    this.logUpdate(transaction, updatedTransaction);
    return eventSent;
  }

  private async checkWalletBalance(transaction: Transaction): Promise<boolean> {
    const wallet = await this.walletService.getByWalletId(transaction.walletId);
    const newBalance = wallet.balance + transaction.amount;
    if (newBalance > 0) {
      this.appLogger.log(
        this.logPrefix,
        `Sufficient balance to perform transaction: ${transaction.id}. Proceeding to emit event.`,
      );
      return true;
    }
    const updatedTransaction = await this.transactionService.update({
      transactionId: transaction.id,
      status: TransactionStatusEnum.FAILED,
    });
    this.logUpdate(
      transaction,
      updatedTransaction,
      `Not sufficient balance on wallet: ${wallet.id}`,
    );
    return false;
  }

  private logUpdate(
    transaction: Transaction,
    updatedTransaction: Transaction,
    msg?: string,
  ): void {
    this.appLogger.log(
      this.logPrefix,
      `${msg} Updating status of transaction: ${updatedTransaction.id} from ${transaction.status} to ${updatedTransaction.status}`,
    );
  }

  private returnFailedEvent(transaction: Transaction): TransactionEvent {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currentCurrency,
      status: TransactionStatusEnum.FAILED,
      originCreatedAt: transaction.clientTransactionDate
        ? transaction.clientTransactionDate
        : new Date(),
    };
  }

  private processNotPendingTransaction(transaction: Transaction): void {
    const err = `Transaction: ${transaction.id} - "${transaction.status}" is not ${TransactionStatusEnum.PENDING}. Unable to complete transaction.`;
    this.appLogger.warn(this.logPrefix, err);
    throw new BadRequestException(err);
  }
}
