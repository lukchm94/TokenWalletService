import { Injectable } from '@nestjs/common';
import { Transaction as TransactionORM } from 'generated/prisma';
import { TransactionStatusEnum } from 'src/shared/validations/transaction/status';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { TransactionInput, UpdateTransactionInput } from '../../app/input';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionRepository } from '../../domain/transaction.repo';

@Injectable()
export class TransactionRepoImpl implements TransactionRepository {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly db: PrismaService,
  ) {}

  async create(input: TransactionInput): Promise<Transaction> {
    this.logger.debug(
      this.logPrefix,
      `Attempting to create a transaction: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
    const result = await this.db.transaction.create({ data: input });
    if (!result) {
      const err = `Error creating transaction with params: ${JSON.stringify(input, jsonStringifyReplacer)}`;
      this.logger.warn(this.logPrefix, err);
      throw new Error(err);
    }
    this.logger.log(this.logPrefix, 'Saved wallet');
    return Transaction.create(result);
  }

  async getByWalletId(
    walletId: number,
    transactionStatus?: TransactionStatusEnum,
  ): Promise<Transaction[]> {
    this.logger.log(
      this.logPrefix,
      `Searching for transactions for wallet: ${walletId} and transactionStatus: ${transactionStatus} `,
    );
    const status = transactionStatus ?? TransactionStatusEnum.PENDING;
    if (status !== transactionStatus) {
      this.logger.debug(
        this.logPrefix,
        `Updated status from: ${transactionStatus} to ${status}`,
      );
    }
    const results = await this.db.transaction.findMany({
      where: { walletId: walletId, status: status },
      orderBy: [{ createdAt: 'asc' }, { updatedAt: 'asc' }],
    });
    if (!results || results.length === 0) {
      const err = `No transactions found for wallet `;
      this.logger.error(this.logPrefix, err);
    }
    const transactions: Transaction[] = [];
    results.forEach((transaction: TransactionORM) => {
      transactions.push(Transaction.create(transaction));
    });
    return transactions;
  }

  async getById(transactionId: number): Promise<Transaction | null> {
    this.logger.log(
      this.logPrefix,
      `Searching for transaction: ${transactionId}`,
    );
    const result = await this.db.transaction.findFirst({
      where: { id: transactionId },
    });
    if (!result) {
      this.logger.warn(
        this.logPrefix,
        `No transaction found with ID: ${transactionId}`,
      );
      return null;
    }
    return Transaction.create(result);
  }

  async updateStatus(input: UpdateTransactionInput): Promise<Transaction> {
    this.logger.log(
      this.logPrefix,
      `Updating transaction: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
    const transaction = await this.db.transaction.findFirst({
      where: { id: input.transactionId },
    });
    if (!transaction) {
      const err = `No transaction found for ID: ${input.transactionId}. Cannot update`;
      this.logger.error(this.logPrefix, err);
      throw new Error(err);
    }
    const updatedTransaction = await this.db.transaction.update({
      where: { id: input.transactionId },
      data: { status: input.status },
    });
    return Transaction.create(updatedTransaction);
  }

  async getByIdempotencyKey(
    idempotencyKey: string,
    clientTransactionDate: Date,
    amount: bigint,
  ): Promise<Transaction | null> {
    this.logger.log(
      this.logPrefix,
      `Searching for transaction with idempotencyKey: ${idempotencyKey}`,
    );
    const result = await this.db.transaction.findFirst({
      where: {
        AND: [
          { idempotencyKey: idempotencyKey },
          { clientTransactionDate: new Date(clientTransactionDate) },
          { amount: amount },
        ],
      },
    });

    if (!result) {
      this.logger.debug(
        this.logPrefix,
        `No transaction found with idempotencyKey: ${idempotencyKey}`,
      );
      return null;
    }

    this.logger.warn(
      this.logPrefix,
      `Found transaction with idempotencyKey: ${result.idempotencyKey}`,
    );

    return Transaction.create(result);
  }
}
