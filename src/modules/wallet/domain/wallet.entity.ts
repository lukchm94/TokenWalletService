import {
  CURRENCY_TYPE,
  CurrencyType,
  validCurrencies,
} from '../../../shared/validations/currency';

export class Wallet {
  constructor(
    public readonly id: number,
    public readonly tokenId: string,
    public balance: bigint,
    public readonly currency: CurrencyType,
  ) {}

  public static create(params: {
    id: number;
    tokenId: string;
    balance: bigint;
    currency: string;
  }): Wallet {
    const validatedCurrency = this.validateCurrency(params.currency);
    return new Wallet(
      params.id,
      params.tokenId,
      params.balance,
      validatedCurrency,
    );
  }

  private static validateCurrency(currency: string): CurrencyType {
    if (!CURRENCY_TYPE.includes(currency as CurrencyType)) {
      throw new Error(
        `Invalid currency type: ${currency}. Valid currencies: ${JSON.stringify(validCurrencies)}`,
      );
    }
    return currency as CurrencyType;
  }
}
