import { FundsInWallet } from 'src/modules/wallet/app/output';
import { Transaction } from '../../domain/transaction.entity';

export interface TransactionOutput {
  transaction: Transaction;
  funds: FundsInWallet | null;
}
