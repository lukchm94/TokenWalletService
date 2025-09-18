export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  GATEWAY = 'GATEWAY',
}

export type TransactionStatusType =
  | TransactionStatusEnum.CANCELLED
  | TransactionStatusEnum.COMPLETED
  | TransactionStatusEnum.FAILED
  | TransactionStatusEnum.PENDING
  | TransactionStatusEnum.GATEWAY;

export const validTransactionStatuses = Object.values(TransactionStatusEnum);

export const TRANSACTION_STATUS_TYPE: TransactionStatusType[] = [
  TransactionStatusEnum.CANCELLED,
  TransactionStatusEnum.COMPLETED,
  TransactionStatusEnum.FAILED,
  TransactionStatusEnum.PENDING,
  TransactionStatusEnum.GATEWAY,
];
