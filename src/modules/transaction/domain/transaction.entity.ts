import {
  CURRENCY_TYPE,
  CurrencyType,
  validCurrencies,
} from '../../../shared/validations/currency';
import {
  TRANSACTION_STATUS_TYPE,
  TransactionStatusType,
  validTransactionStatuses,
} from '../../../shared/validations/transaction/status';
import {
  TRANSACTION_TYPE_ARRAY,
  TransactionType,
  validTransactionTypes,
} from '../../../shared/validations/transaction/type';

export class Transaction {
  constructor(
    public readonly id: number,
    public readonly walletId: number,
    public readonly type: TransactionType,
    public readonly status: TransactionStatusType,
    public readonly originCurrency: CurrencyType,
    public readonly currentCurrency: CurrencyType,
    public readonly amount: bigint,
  ) {}

  public static create(params: {
    id: number;
    walletId: number;
    type: string;
    status: string;
    originCurrency: string;
    currentCurrency: string;
    amount: bigint;
  }): Transaction {
    const type = this.validateTransactionType(params.type);
    const status = this.validateTransactionStatus(params.status);
    const origin = this.validateCurrency(params.originCurrency);
    const current = this.validateCurrency(params.currentCurrency);

    return new Transaction(
      params.id,
      params.walletId,
      type,
      status,
      origin,
      current,
      params.amount,
    );
  }

  private static validateTransactionType(type: string): TransactionType {
    if (!TRANSACTION_TYPE_ARRAY.includes(type as TransactionType)) {
      throw new Error(
        `Invalid transaction type: ${type}. Allowed transaction types: ${JSON.stringify(validTransactionTypes)}`,
      );
    }
    return type as TransactionType;
  }

  private static validateTransactionStatus(
    status: string,
  ): TransactionStatusType {
    if (!TRANSACTION_STATUS_TYPE.includes(status as TransactionStatusType)) {
      throw new Error(
        `Invalid transaction status: ${status}. Allowed transaction types: ${JSON.stringify(validTransactionStatuses)}`,
      );
    }
    return status as TransactionStatusType;
  }
  private static validateCurrency(currency: string): CurrencyType {
    if (!CURRENCY_TYPE.includes(currency as CurrencyType)) {
      throw new Error(
        `Invalid currency type: ${currency}. Allowed currencies: ${JSON.stringify(validCurrencies)}`,
      );
    }
    return currency as CurrencyType;
  }
}
