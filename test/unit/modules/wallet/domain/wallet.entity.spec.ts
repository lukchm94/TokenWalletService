import { Wallet } from 'src/modules/wallet/domain/wallet.entity';
import { CurrencyEnum } from 'src/shared/validations/currency';

// Mock the shared/validations/currency module to ensure tests are self-contained.
jest.mock('../../../shared/validations/currency', () => ({
  CurrencyEnum: {
    EUR: 'EUR',
    USD: 'USD',
    PLN: 'PLN',
  },
}));

describe('Wallet', () => {
  // A helper function to create valid wallet parameters for testing
  const validWalletParams = {
    id: 1,
    tokenId: 'mock-token-id',
    balance: 100,
    currency: CurrencyEnum.USD,
  };

  // Test suite for the static 'create' method
  describe('create', () => {
    it('should create a new Wallet instance with valid parameters', () => {
      const wallet = Wallet.create(validWalletParams);
      expect(wallet).toBeInstanceOf(Wallet);
      expect(wallet.id).toBe(validWalletParams.id);
      expect(wallet.tokenId).toBe(validWalletParams.tokenId);
      expect(wallet.balance).toBe(validWalletParams.balance);
      expect(wallet.currency).toBe(validWalletParams.currency);
    });

    it('should throw an error for an invalid currency type', () => {
      const invalidParams = {
        ...validWalletParams,
        currency: 'invalid_currency',
      };
      // We expect the call to Wallet.create to throw an error
      expect(() => Wallet.create(invalidParams)).toThrowError(
        'Invalid currency type: invalid_currency',
      );
    });
  });

  // Test suite for the static 'validateCurrency' private method
  // We use bracket notation to access the private method for testing purposes.
  // In a real-world scenario, you might test this functionality via the public `create` method.
  describe('validateCurrency', () => {
    const validateCurrency = Wallet['validateCurrency'] as (
      currency: string,
    ) => string;

    it('should return the currency if it is valid', () => {
      const validCurrency = 'EUR';
      const result = validateCurrency(validCurrency);
      expect(result).toBe(validCurrency);
    });

    it('should throw an error if the currency is invalid', () => {
      const invalidCurrency = 'CAD';
      expect(() => validateCurrency(invalidCurrency)).toThrowError(
        'Invalid currency type: CAD',
      );
    });
  });

  // Test suite for general class properties and methods
  describe('class properties', () => {
    it('should have a static CURRENCY_TYPE array', () => {
      expect(Wallet.CURRENCY_TYPE).toEqual(
        expect.arrayContaining([
          CurrencyEnum.EUR,
          CurrencyEnum.USD,
          CurrencyEnum.PLN,
        ]),
      );
    });
  });
});
