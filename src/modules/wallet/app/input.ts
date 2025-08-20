import { CurrencyEnum } from 'src/shared/validations/currency';

export interface CreateWalletInput {
  tokenId: string;
  balance: bigint;
  currency: CurrencyEnum;
}

export interface UpdateBalanceInput {
  tokenId: string;
  balance: bigint;
}

export interface CreditCard {
  num: number;
  currency: CurrencyEnum;
  balance?: bigint;
}

export interface TriggerExchange {
  tokenId: string;
  targetCurrency: CurrencyEnum;
}
