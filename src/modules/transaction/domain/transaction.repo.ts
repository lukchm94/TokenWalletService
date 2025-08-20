import { InjectionToken } from '@nestjs/common';
import { TransactionInput, UpdateTransactionInput } from '../app/input';
import { Transaction } from './transaction.entity';

export interface TransactionRepository {
  create(input: TransactionInput): Promise<Transaction>;
  getByWalletId(walletId: number): Promise<Transaction[]>;
  getById(transactionId: number): Promise<Transaction | null>;
  updateStatus(input: UpdateTransactionInput): Promise<Transaction>;
}

export const TRANSACTION_REPOSITORY_TOKEN: InjectionToken<TransactionRepository> =
  'TransactionRepository';
