import { Transaction } from '../../../../../src/modules/transaction/domain/transaction.entity';

describe('Transaction', () => {
  const validTransactionParams = {
    id: 1,
    walletId: 1,
    type: 'EXCHANGE',
    status: 'COMPLETED',
    originCurrency: 'EUR',
    currentCurrency: 'USD',
    amount: BigInt(1000),
  };

  describe('create', () => {
    it('should create a new Transaction from valid parameters', () => {
      const transaction = Transaction.create(validTransactionParams);

      expect(transaction).toBeInstanceOf(Transaction);
    });
  });
});
