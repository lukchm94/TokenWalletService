import { Injectable } from '@nestjs/common';
import { FundsRepresentation } from '../../../modules/wallet/api/representation';
import { FundsInWallet } from '../../../modules/wallet/app/output';
import { TransactionOutput } from '../app/complete-transaction-use-case/output';
import { Transaction } from '../domain/transaction.entity';
import {
  OutputRepresentation,
  TransactionRepresentation,
} from './representation';

@Injectable()
export class TransactionRepresentationMapper {
  constructor() {}
  public getOutput(outputs: TransactionOutput[]): OutputRepresentation[] {
    const representation: OutputRepresentation[] = [];
    for (const output of outputs) {
      representation.push({
        transaction: this.getTransaction(output.transaction),
        balance: this.getFundsRepresentation(output.funds),
      });
    }

    return representation;
  }

  public getTransaction(transaction: Transaction): TransactionRepresentation {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      type: transaction.type,
      status: transaction.status,
      originCurrency: transaction.originCurrency,
      currentCurrency: transaction.currentCurrency,
      amount: Number(transaction.amount),
    };
  }

  private getFundsRepresentation(
    funds: FundsInWallet | null,
  ): FundsRepresentation | null {
    if (!funds) {
      return null;
    }
    return {
      tokenId: funds.tokenId,
      oldBalance: Number(funds.oldBalance),
      currentBalance: Number(funds.currentBalance),
      currency: funds.currency,
    };
  }
}
