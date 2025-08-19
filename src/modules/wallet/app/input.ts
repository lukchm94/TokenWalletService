import { CurrencyEnum } from 'src/shared/validations/currency';

export interface CreateWalletInput {
  tokenId: string;
  balance: number;
  currency: string;
}

export interface UpdateBalanceInput {
  tokenId: string;
  balance: number;
}

export interface CreditCard {
  num: number;
  currency: string;
  balance?: number;
}

export interface TriggerExchange {
  tokenId: string;
  targetCurrency: CurrencyEnum;
}
