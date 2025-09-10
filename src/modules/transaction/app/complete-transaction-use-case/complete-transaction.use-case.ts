import { BadGatewayException, Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { GatewayOutput } from '../../../gateway/api/output';
import { GatewayService } from '../../../gateway/domain/gateway.service';
import { WalletService } from '../../../wallet/app/services/app-wallet.service';
import { TransactionService } from '../../domain/services/transaction.service';
import { Transaction } from '../../domain/transaction.entity';
import { WebhookPayload } from '../input';

@Injectable()
export class CompleteTransactionUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
    private readonly gatewayService: GatewayService,
  ) {}

  public async run(
    walletId: number,
    transactionStatus?: TransactionStatusEnum,
  ): Promise<GatewayOutput[]> {
    this.logger.log(
      this.logPrefix,
      `Updating ${TransactionStatusEnum.PENDING} transactions for wallet: ${walletId}`,
    );
    const results: GatewayOutput[] = [];
    const transactions: Transaction[] =
      await this.transactionService.getAllTransactionsByWallet(
        walletId,
        transactionStatus,
      );

    for (const transaction of transactions) {
      if (transaction.status === TransactionStatusEnum.PENDING) {
        const transactionResult = await this.callGateway(transaction);
        results.push(transactionResult);
      }
    }
    return results;
  }

  /**
   * The function `callGateway` processes a transaction by checking the wallet balance, determining the
   * transaction status, and interacting with a gateway service.
   * @param {Transaction} transaction - The `transaction` parameter in the `callGateway` function
   * represents an object containing information about a financial transaction. It likely includes
   * properties such as `id`, `walletId`, `amount`, and other relevant details needed to process the
   * transaction. This function is responsible for interacting with a gateway service to process
   * @returns The function `callGateway` returns a `Promise` that resolves to a `GatewayOutput` object.
   */
  private async callGateway(transaction: Transaction): Promise<GatewayOutput> {
    const wallet = await this.walletService.getByWalletId(transaction.walletId);
    const newBalance = wallet.balance + transaction.amount;
    const status: TransactionStatusEnum =
      newBalance < 0
        ? TransactionStatusEnum.FAILED
        : TransactionStatusEnum.PENDING;

    if (status === TransactionStatusEnum.FAILED) {
      return this.updateFailedTransaction(transaction, newBalance);
    }

    const gatewayPayload = this.buildWebhookPayload(transaction, status);
    const gatewayResponse = await this.gatewayService.getStatus(gatewayPayload);
    if (gatewayResponse.status !== 200) {
      const err = `Gateway response status: ${gatewayResponse.status} for transaction: ${transaction.id}`;
      this.logger.error(this.logPrefix, err);
      throw new BadGatewayException(err);
    }
    return gatewayResponse;
  }

  private buildWebhookPayload(
    transaction: Transaction,
    status: TransactionStatusEnum,
  ): WebhookPayload {
    const payload: WebhookPayload = {
      id: transaction.id,
      status,
      amount: Number(transaction.amount),
      currency: transaction.currentCurrency,
      originCreatedAt: transaction.clientTransactionDate
        ? transaction.clientTransactionDate
        : new Date(),
    };
    return payload;
  }

  private async updateFailedTransaction(
    transaction: Transaction,
    newBalance: bigint,
  ): Promise<GatewayOutput> {
    this.logger.warn(
      this.logPrefix,
      `Transaction: ${transaction.id} failed to complete. New balance: ${Number(newBalance)} is less than 0.`,
    );
    const updatedTransaction = await this.transactionService.update({
      transactionId: transaction.id,
      status: TransactionStatusEnum.FAILED,
    });
    this.logger.log(
      this.logPrefix,
      `Transaction: ${updatedTransaction.id} updated to status: ${updatedTransaction.status} successfully.`,
    );
    return {
      status: 200,
      statusText: 'OK',
      data: {
        transactionId: updatedTransaction.id,
        transactionStatus: updatedTransaction.status,
      },
    };
  }
}
