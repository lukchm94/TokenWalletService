import { CurrencyType } from 'src/shared/validations/currency';

export interface FundsInWallet {
  tokenId: string;
  oldBalance: bigint;
  currentBalance: bigint;
  currency: CurrencyType;
}

export interface ExchangeAttempt {
  newCurrency: CurrencyType;
  exchangeRate: number;
  amount: bigint;
  convertedAt: Date;
}
