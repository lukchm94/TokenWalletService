import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { WalletService } from '../../../wallet/app/services/app-wallet.service';
import { TransactionService } from '../../domain/services/transaction.service';
import { TransactionOutput } from '../complete-transaction-use-case/output';
import { UpdateTransactionInput } from '../input';
import { UpdateSourceEnum } from './update.source.enum';

@Injectable()
export class UpdateTransactionGatewayResponseUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly appLogger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * This TypeScript function updates a transaction based on input data from a webhook and handles
   * balance updates in a wallet.
   * @param {UpdateTransactionInput} input - The `run` function you provided is an asynchronous
   * function that updates a transaction based on the input received. The `input` parameter is of type
   * `UpdateTransactionInput`, which contains information about the transaction to be updated. The
   * function first logs the details of the input, retrieves the transaction and wallet information
   * @returns The `run` function returns a `TransactionOutput` object, which contains the updated
   * transaction and, if the transaction status is `COMPLETED`, the updated funds in the wallet. If the
   * transaction status is not `COMPLETED`, the `funds` property in the output will be `null`.
   */
  public async run(
    input: UpdateTransactionInput,
    source: UpdateSourceEnum,
  ): Promise<TransactionOutput> {
    this.appLogger.log(
      this.logPrefix,
      `Updating transaction from: ${source}: ${JSON.stringify(input)}`,
    );
    const transactionId: number = input.transactionId;
    const transactionInput =
      await this.transactionService.getById(transactionId);

    const wallet = await this.walletService.getByWalletId(
      transactionInput.walletId,
    );

    const updateTransactionInput: UpdateTransactionInput = {
      transactionId: transactionId,
      status: input.status,
    };

    const transaction = await this.transactionService.update(
      updateTransactionInput,
    );

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
