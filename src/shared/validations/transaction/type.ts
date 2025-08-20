export enum TransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  EXCHANGE = 'EXCHANGE',
}

export type TransactionType =
  | TransactionTypeEnum.DEPOSIT
  | TransactionTypeEnum.WITHDRAWAL
  | TransactionTypeEnum.EXCHANGE;

export const validTransactionTypes = Object.values(TransactionTypeEnum);

export const TRANSACTION_TYPE_ARRAY: TransactionType[] = [
  TransactionTypeEnum.DEPOSIT,
  TransactionTypeEnum.WITHDRAWAL,
  TransactionTypeEnum.EXCHANGE,
];
