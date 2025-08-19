import { CurrencyType } from 'src/shared/validations/currency';

export interface FundsInWallet {
  tokenId: string;
  oldBalance: number;
  currentBalance: number;
  currency: CurrencyType;
}

export interface ExchangeAttempt {
  newCurrency: CurrencyType;
  exchangeRate: number;
  amount: number;
  convertedAt: Date;
}
