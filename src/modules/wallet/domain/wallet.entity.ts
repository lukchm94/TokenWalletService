import {
  CurrencyEnum,
  CurrencyType,
} from '../../../shared/validations/currency';

export class Wallet {
  constructor(
    public readonly id: number,
    public readonly tokenId: string,
    public balance: number,
    public readonly currency: CurrencyType,
  ) {}

  public static CURRENCY_TYPE: CurrencyType[] = [
    CurrencyEnum.EUR,
    CurrencyEnum.USD,
    CurrencyEnum.GBP,
    CurrencyEnum.HKD,
    CurrencyEnum.PLN,
  ];

  public static create(params: {
    id: number;
    tokenId: string;
    balance: number;
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
    if (!this.CURRENCY_TYPE.includes(currency as CurrencyType)) {
      throw new Error(`Invalid currency type: ${currency}`);
    }
    return currency as CurrencyType;
  }
}
