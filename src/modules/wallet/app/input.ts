import { CurrencyEnum } from 'src/shared/validations/currency';

export interface CreateWalletInput {
  tokenId: string;
  balance: number;
  currency: CurrencyEnum;
}

export interface UpdateBalanceInput {
  tokenId: string;
  balance: number;
}

export interface CreditCard {
  num: number;
  currency: CurrencyEnum;
  balance?: number;
}

export interface TriggerExchange {
  tokenId: string;
  targetCurrency: CurrencyEnum;
}
