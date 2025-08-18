export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  HKD = 'HKD',
  PLN = 'PLN',
}

export type CurrencyType =
  | CurrencyEnum.EUR
  | CurrencyEnum.USD
  | CurrencyEnum.GBP
  | CurrencyEnum.HKD
  | CurrencyEnum.PLN;

export const validCurrencies = Object.values(CurrencyEnum);
