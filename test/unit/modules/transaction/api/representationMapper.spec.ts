import { TransactionRepresentationMapper } from '../../../../../src/modules/transaction/api/representationMapper';
import { TransactionOutput } from '../../../../../src/modules/transaction/app/complete-transaction-use-case/output';
import { Transaction } from '../../../../../src/modules/transaction/domain/transaction.entity';
import { FundsRepresentation } from '../../../../../src/modules/wallet/api/representation';
import { FundsInWallet } from '../../../../../src/modules/wallet/app/output';
import { TransactionStatusEnum } from '../../../../../src/shared/validations/transaction/status';
import { TransactionTypeEnum } from '../../../../../src/shared/validations/transaction/type';

/**
 * Unit tests for the TransactionRepresentationMapper.
 * This test suite focuses on the mapper's logic, ensuring it correctly
 * transforms domain objects into API-level representations.
 */
describe('TransactionRepresentationMapper', () => {
  let mapper: TransactionRepresentationMapper;

  beforeEach(() => {
    // Instantiate the mapper class directly as it has no dependencies.
    mapper = new TransactionRepresentationMapper();
  });

  // Sample data for a complete transaction with funds
  const mockTransactionWithFunds: TransactionOutput = {
    transaction: {
      id: 1,
      walletId: 101,
      type: TransactionTypeEnum.EXCHANGE,
      status: TransactionStatusEnum.COMPLETED,
      originCurrency: 'USD',
      currentCurrency: 'EUR',
      amount: BigInt(100),
    } as Transaction,
    funds: {
      tokenId: 'abc-123',
      oldBalance: BigInt(500),
      currentBalance: BigInt(400),
      currency: 'USD',
    } as FundsInWallet,
  };

  // Sample data for a failed transaction with null funds
  const mockTransactionWithoutFunds: TransactionOutput = {
    transaction: {
      id: 2,
      walletId: 102,
      type: TransactionTypeEnum.EXCHANGE,
      status: TransactionStatusEnum.FAILED,
      originCurrency: 'EUR',
      currentCurrency: 'USD',
      amount: BigInt(50),
    } as Transaction,
    funds: null,
  };

  /**
   * Test the `getOutput` method for a valid transaction with associated funds.
   */
  describe('getOutput', () => {
    it('should correctly map a TransactionOutput with funds to an OutputRepresentation', () => {
      // Act
      const result = mapper.getOutput([mockTransactionWithFunds]);

      // Assert
      expect(result).toHaveLength(1);
      const output = result[0];

      // Verify transaction properties
      expect(output.transaction.id).toBe(
        mockTransactionWithFunds.transaction.id,
      );
      expect(output.transaction.walletId).toBe(
        mockTransactionWithFunds.transaction.walletId,
      );
      expect(output.transaction.type).toBe(
        mockTransactionWithFunds.transaction.type,
      );
      expect(output.transaction.amount).toBe(
        Number(mockTransactionWithFunds.transaction.amount),
      );

      // Verify funds properties
      expect(output.balance).not.toBeNull();
      const fundsBalance = output.balance as FundsRepresentation;
      expect(fundsBalance.tokenId).toBe(
        mockTransactionWithFunds.funds?.tokenId,
      );
      expect(fundsBalance.oldBalance).toBe(
        Number(mockTransactionWithFunds.funds?.oldBalance),
      );
      expect(fundsBalance.currentBalance).toBe(
        Number(mockTransactionWithFunds.funds?.currentBalance),
      );
      expect(fundsBalance.currency).toBe(
        mockTransactionWithFunds.funds?.currency,
      );
    });

    /**
     * Test the `getOutput` method for a transaction without associated funds (e.g., a failed transaction).
     */
    it('should correctly map a TransactionOutput with null funds to an OutputRepresentation', () => {
      // Act
      const result = mapper.getOutput([mockTransactionWithoutFunds]);

      // Assert
      expect(result).toHaveLength(1);
      const output = result[0];

      // Verify transaction properties
      expect(output.transaction.id).toBe(
        mockTransactionWithoutFunds.transaction.id,
      );
      expect(output.transaction.walletId).toBe(
        mockTransactionWithoutFunds.transaction.walletId,
      );
      expect(output.transaction.status).toBe(
        mockTransactionWithoutFunds.transaction.status,
      );

      // Verify that the balances property is null
      expect(output.balance).toBeNull();
    });
  });

  /**
   * Test the `getFundsRepresentation` method in isolation.
   */
  describe('getFundsRepresentation', () => {
    it('should return a FundsRepresentation object when funds are provided', () => {
      // Act
      const funds = mockTransactionWithFunds.funds as FundsInWallet;
      const result = mapper['getFundsRepresentation'](funds); // Accessing private method for testing

      // Assert
      expect(result).not.toBeNull();
      expect(result?.tokenId).toBe(funds.tokenId);
      expect(result?.oldBalance).toBe(Number(funds.oldBalance));
      expect(result?.currentBalance).toBe(Number(funds.currentBalance));
      expect(result?.currency).toBe(funds.currency);
    });

    it('should return null when funds are null', () => {
      // Act
      const result = mapper['getFundsRepresentation'](null);

      // Assert
      expect(result).toBeNull();
    });
  });
});
