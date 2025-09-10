import { CurrencyEnum } from '../../../shared/validations/currency';
import { TransactionStatusEnum } from '../../../shared/validations/transaction/status';
import { TransactionTypeEnum } from '../../../shared/validations/transaction/type';

export interface CreateTransactionInput {
  tokenId: string;
  targetCurrency: CurrencyEnum;
  amount: bigint;
  clientTransactionDate: Date;
  idempotencyKey: string;
}

export interface UpdateTransactionInput {
  transactionId: number;
  status: TransactionStatusEnum;
}

export interface TransactionInput {
  walletId: number;
  type: TransactionTypeEnum;
  status: TransactionStatusEnum;
  originCurrency: CurrencyEnum;
  currentCurrency: CurrencyEnum;
  amount: bigint;
  clientTransactionDate?: Date;
  idempotencyKey?: string;
}

export interface WebhookPayload {
  id: number;
  status: TransactionStatusEnum;
  amount: number;
  currency: CurrencyEnum;
  originCreatedAt: Date;
}
