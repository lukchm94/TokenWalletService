import { Injectable } from '@nestjs/common';
import { WalletService } from 'src/modules/wallet/app/services/app-wallet.service';
import { TransactionStatusEnum } from 'src/shared/validations/transaction/status';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionService } from '../../domain/services/transaction.service';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionOutput } from './output';

@Injectable()
export class CompleteTransactionUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  public async run(
    walletId: number,
    transactionStatus?: TransactionStatusEnum,
  ): Promise<TransactionOutput[]> {
    this.logger.log(
      this.logPrefix,
      `Updating ${TransactionStatusEnum.PENDING} transactions for wallet: ${walletId}`,
    );
    const results: TransactionOutput[] = [];
    const transactions: Transaction[] =
      await this.transactionService.getAllTransactionsByWallet(
        walletId,
        transactionStatus,
      );

    for (const transaction of transactions) {
      if (transaction.status === TransactionStatusEnum.PENDING) {
        const transactionResult = await this.updateTransaction(transaction);
        results.push(transactionResult);
      }
    }
    return results;
  }

  private async updateTransaction(
    transaction: Transaction,
  ): Promise<TransactionOutput> {
    const wallet = await this.walletService.getByWalletId(transaction.walletId);
    const newBalance = wallet.balance + transaction.amount;
    const status: TransactionStatusEnum =
      newBalance < 0
        ? TransactionStatusEnum.FAILED
        : TransactionStatusEnum.COMPLETED;

    const updatedTransaction = await this.transactionService.update({
      transactionId: transaction.id,
      status,
    });

    if (updatedTransaction.status === TransactionStatusEnum.COMPLETED) {
      const funds = await this.walletService.updateBalance(
        wallet.tokenId,
        transaction.amount,
        transaction.currentCurrency,
      );
      return { transaction: updatedTransaction, funds };
    }
    return { transaction: updatedTransaction, funds: null };
  }
}
