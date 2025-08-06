export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  HKD = 'HKD',
}

export type CurrencyType =
  | CurrencyEnum.EUR
  | CurrencyEnum.USD
  | CurrencyEnum.GBP
  | CurrencyEnum.HKD;
