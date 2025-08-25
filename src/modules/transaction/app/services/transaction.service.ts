import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { Transaction } from '../../domain/transaction.entity';
import type { TransactionRepository } from '../../domain/transaction.repo';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../domain/transaction.repo';
import { TransactionInput, UpdateTransactionInput } from '../input';

@Injectable()
export class TransactionService {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepo: TransactionRepository,
  ) {}

  public async create(input: TransactionInput): Promise<Transaction> {
    this.logger.log(
      this.logPrefix,
      `Attempting to create transaction: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
    const transaction = await this.transactionRepo.create(input);

    if (!transaction) {
      const err = `Error occurred when saving transaction ${JSON.stringify(input, jsonStringifyReplacer)}`;
      this.logger.warn(this.logPrefix, err);
      throw new Error(err);
    }
    this.logger.log(
      this.logPrefix,
      `✅ Saved transaction: ${transaction.id} successfully.`,
    );
    return transaction;
  }

  public async update(input: UpdateTransactionInput): Promise<Transaction> {
    this.logger.log(
      this.logPrefix,
      `Updating status of transaction: ${input.transactionId} with status: ${input.status}`,
    );
    const transaction = await this.transactionRepo.getById(input.transactionId);
    if (!transaction) {
      throw new BadRequestException(
        `Transaction with ID: ${input.transactionId} NOT FOUND`,
      );
    }
    if (transaction.status === input.status) {
      throw new BadRequestException(
        `Current status of transaction: ${transaction.status} is the same as the requested one: ${input.status}. No action needed. `,
      );
    }
    const updatedTransaction = await this.transactionRepo.updateStatus(input);
    if (!updatedTransaction) {
      const err = `Error occurred when saving transaction ${JSON.stringify(updatedTransaction, jsonStringifyReplacer)}`;
      this.logger.warn(this.logPrefix, err);
      throw new Error(err);
    }
    this.logger.log(
      this.logPrefix,
      `✅ Updated transaction: ${updatedTransaction.id} to status: ${updatedTransaction.status} successfully.`,
    );
    return updatedTransaction;
  }

  public async getAllTransactionsByWallet(
    walletId: number,
  ): Promise<Transaction[]> {
    return await this.transactionRepo.getByWalletId(walletId);
  }
}
