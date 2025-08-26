import { FundsRepresentation } from 'src/modules/wallet/api/representation';
import { CurrencyEnum } from '../../../shared/validations/currency';
import { TransactionStatusEnum } from '../../../shared/validations/transaction/status';
import { TransactionTypeEnum } from '../../../shared/validations/transaction/type';

export interface TransactionRepresentation {
  id: number;
  walletId: number;
  type: TransactionTypeEnum;
  status: TransactionStatusEnum;
  originCurrency: CurrencyEnum;
  currentCurrency: CurrencyEnum;
  amount: number;
}

export interface OutputRepresentation {
  transaction: TransactionRepresentation;
  balance: FundsRepresentation | null;
}
