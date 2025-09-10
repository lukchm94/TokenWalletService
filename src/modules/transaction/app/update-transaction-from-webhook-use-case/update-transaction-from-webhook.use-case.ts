import { Injectable } from '@nestjs/common';
import { WalletService } from '../../../../modules/wallet/app/services/app-wallet.service';
import { TransactionWebhookDto } from '../../../../shared/dto/transaction-webhook-payload.dto';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { TransactionService } from '../../domain/services/transaction.service';
import { TransactionOutput } from '../complete-transaction-use-case/output';
import { UpdateTransactionInput } from '../input';

@Injectable()
export class UpdateTransactionFromWebhookUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly appLogger: AppLoggerService,
    private readonly service: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * This TypeScript function updates a transaction based on a webhook payload and handles balance
   * updates for a wallet.
   * @param {TransactionWebhookDto} webhookPayload - The `webhookPayload` parameter in the `run` function
   * represents the data received from a webhook. It contains information about a transaction, such as
   * the transaction ID and status.
   * @returns The `run` function returns a `TransactionOutput` object, which contains two properties:
   * 1. `transaction`: This property contains the updated transaction object after processing the
   * webhook payload.
   * 2. `funds`: This property contains the updated funds in the wallet if the transaction status is
   * `COMPLETED`, otherwise it is `null`.
   */
  public async run(
    webhookPayload: TransactionWebhookDto,
  ): Promise<TransactionOutput> {
    // Here we only receive the transaction with sufficient balance which can be failed only at Gateway
    this.appLogger.log(
      this.logPrefix,
      `Updating transaction from webhook: ${JSON.stringify(webhookPayload)}`,
    );
    const transactionId: number = webhookPayload.id;
    const transactionInput = await this.service.getById(transactionId);

    const wallet = await this.walletService.getByWalletId(
      transactionInput.walletId,
    );

    const updateTransactionInput: UpdateTransactionInput = {
      transactionId: transactionId,
      status: webhookPayload.status,
    };

    const transaction = await this.service.update(updateTransactionInput);

    if (transaction.status === TransactionStatusEnum.COMPLETED) {
      const funds = await this.walletService.updateBalance(
        wallet.tokenId,
        transaction.amount,
        transaction.currentCurrency,
      );
      return { transaction: transaction, funds };
    }
    return { transaction: transaction, funds: null };
  }
}
