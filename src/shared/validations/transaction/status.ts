export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export type TransactionStatusType =
  | TransactionStatusEnum.CANCELLED
  | TransactionStatusEnum.COMPLETED
  | TransactionStatusEnum.FAILED
  | TransactionStatusEnum.PENDING;

export const validTransactionStatuses = Object.values(TransactionStatusEnum);

export const TRANSACTION_STATUS_TYPE: TransactionStatusType[] = [
  TransactionStatusEnum.CANCELLED,
  TransactionStatusEnum.COMPLETED,
  TransactionStatusEnum.FAILED,
  TransactionStatusEnum.PENDING,
];
