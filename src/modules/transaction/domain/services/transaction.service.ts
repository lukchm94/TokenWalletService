import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { TransactionInput, UpdateTransactionInput } from '../../app/input';
import { Transaction } from '../../domain/transaction.entity';
import type { TransactionRepository } from '../../domain/transaction.repo';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../domain/transaction.repo';

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
    transactionStatus?: TransactionStatusEnum,
  ): Promise<Transaction[]> {
    const results = await this.transactionRepo.getByWalletId(
      walletId,
      transactionStatus,
    );
    if (results.length === 0) {
      const err = `No transaction found for wallet: ${walletId}`;
      this.logger.log(this.logPrefix, err);
      throw new BadRequestException(err);
    }
    return results;
  }

  public async getById(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepo.getById(id);
    if (!transaction) {
      const err = `No transaction found for ID: ${id}`;
      this.logger.error(this.logPrefix, err);
      throw new BadRequestException(err);
    }
    return transaction;
  }

  public async checkIdempotency(
    idempotencyKey: string,
    clientTransactionDate: Date,
    amount: bigint,
  ): Promise<void> {
    const transaction = await this.transactionRepo.getByIdempotencyKey(
      idempotencyKey,
      clientTransactionDate,
      amount,
    );
    if (transaction) {
      const err = `Transaction found for Idempotency Key: ${idempotencyKey}`;
      this.logger.error(this.logPrefix, err);
      throw new ConflictException(err);
    }
    this.logger.debug(
      this.logPrefix,
      `No existing transaction found for Idempotency Key: ${idempotencyKey}. Proceeding to create a new one.`,
    );
  }
}
