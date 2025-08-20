import { CurrencyEnum, CurrencyType } from 'src/shared/validations/currency';
export interface WalletRepresentation {
  id: number;
  tokenId: string;
  balance: number;
  currency: CurrencyEnum;
}

export interface FundsRepresentation {
  tokenId: string;
  oldBalance: number;
  currentBalance: number;
  currency: CurrencyType;
}

export interface ExchangeRepresentation {
  newCurrency: CurrencyType;
  exchangeRate: number;
  amount: number;
  convertedAt: Date;
}
