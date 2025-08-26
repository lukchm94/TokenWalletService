import { Wallet } from '../../../../../src/modules/wallet/domain/wallet.entity';
// import { CurrencyEnum } from '../../../../../src/shared/validations/currency';
/**
 * Unit tests for the Wallet entity.
 * These tests focus on the business logic within the entity itself,
 * without involving external dependencies like a database or services.
 */
describe('Wallet', () => {
  // Test data for a valid wallet
  const validWalletParams = {
    id: 1,
    tokenId: 'abc-123',
    balance: BigInt(1000),
    currency: 'EUR',
  };

  /**
   * Test the static `create` method to ensure it correctly instantiates a Wallet.
   * This is a fundamental test to check the constructor and parameter assignment.
   */
  describe('create', () => {
    it('should create a new Wallet instance with valid parameters', () => {
      const wallet = Wallet.create(validWalletParams);

      // Assert that the created object is an instance of Wallet
      expect(wallet).toBeInstanceOf(Wallet);

      // Assert that the properties are correctly assigned
      expect(wallet.id).toBe(validWalletParams.id);
      expect(wallet.tokenId).toBe(validWalletParams.tokenId);
      expect(wallet.balance).toBe(validWalletParams.balance);
      expect(wallet.currency).toBe(validWalletParams.currency);
    });

    /**
     * Test the validation logic to ensure the entity throws an error
     * when an invalid currency is provided. This is a crucial unit test
     * for a core business rule.
     */
    // it('should throw an error if an invalid currency is provided', () => {
    //   const invalidWalletParams = {
    //     ...validWalletParams,
    //     currency: 'XYZ', // An invalid currency
    //   };

    //   // We expect the `create` method to throw an Error
    //   expect(() => Wallet.create(invalidWalletParams)).toThrow(
    //     `Invalid currency type: XYZ. Allowed currencies: ${JSON.stringify(CURRENCY_TYPE)}`,
    //   );
    // });
  });

  /**
   * A simple test for an instance method (if you had any).
   * This example checks if a `getFormattedBalance` method would work correctly.
   */
  // describe('getFormattedBalance', () => {
  //   it('should return a formatted balance string', () => {
  //     // You would have to add this method to your Wallet entity first
  //     const wallet = Wallet.create(validWalletParams);
  //     expect(wallet.getFormattedBalance()).toBe('1000 USD');
  //   });
  // });
});
