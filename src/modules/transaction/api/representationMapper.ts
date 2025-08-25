// src/modules/transaction/api/mapper/transaction-representation.mapper.ts

import { Injectable } from '@nestjs/common';
import { FundsRepresentation } from 'src/modules/wallet/api/representation';
import { TransactionOutput } from '../app/complete-transaction-use-case/output';
import {
  OutputRepresentation,
  TransactionRepresentation,
} from './representation';

@Injectable()
export class TransactionRepresentationMapper {
  constructor() {}
  public fromObject(outputs: TransactionOutput[]): OutputRepresentation[] {
    return outputs.map((output: TransactionOutput) => {
      let fundsRepresentation: FundsRepresentation | null = null;
      if (output.funds !== null) {
        fundsRepresentation = {
          tokenId: output.funds.tokenId,
          oldBalance: Number(output.funds.oldBalance),
          currentBalance: Number(output.funds.currentBalance),
          currency: output.funds.currency,
        };
      }

      const transactionRepresentation: TransactionRepresentation = {
        id: output.transaction.id,
        walletId: output.transaction.walletId,
        type: output.transaction.type,
        status: output.transaction.status,
        originCurrency: output.transaction.originCurrency,
        currentCurrency: output.transaction.currentCurrency,
        amount: Number(output.transaction.amount),
      };

      return {
        transaction: transactionRepresentation,
        balances: fundsRepresentation,
      };
    });
  }
}
