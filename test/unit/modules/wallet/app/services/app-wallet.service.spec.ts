/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../../../../../src/modules/wallet/app/services/app-wallet.service';
import { TokenizationService } from '../../../../../../src/modules/wallet/app/services/tokenization.service';
import { Wallet } from '../../../../../../src/modules/wallet/domain/wallet.entity';
import {
  WALLET_REPOSITORY_TOKEN,
  WalletRepository,
} from '../../../../../../src/modules/wallet/domain/wallet.repo';
import { ExchangeRate } from '../../../../../../src/shared/clients/currencyExchange/output';
import { CurrencyClientService } from '../../../../../../src/shared/clients/currencyExchange/services/currency.service';
import { AppLoggerService } from '../../../../../../src/shared/logger/app-logger.service';
import { CurrencyEnum } from '../../../../../../src/shared/validations/currency';

/**
 * Unit tests for the WalletService.
 * This suite uses a mock-based approach to isolate the WalletService and test its methods
 * without relying on a real database or external API calls.
 */
describe('WalletService', () => {
  let service: WalletService;
  let mockAppLoggerService: AppLoggerService;
  let mockTokenizationService: TokenizationService;
  let mockCurrencyClientService: CurrencyClientService;
  let mockWalletRepository: WalletRepository;

  beforeEach(async () => {
    // Instantiate all mock dependencies as jest functions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockAppLoggerService = {
      debug: jest.fn(),
      error: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockTokenizationService = {
      generateToken: jest.fn().mockReturnValue('mocked-token-id'),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockCurrencyClientService = {
      getExchangeRate: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockWalletRepository = {
      createWallet: jest.fn(),
      getAllWallets: jest.fn(),
      updateWalletBalance: jest.fn(),
      getWalletByTokenId: jest.fn(),
      deleteWallet: jest.fn(),
      getById: jest.fn(),
    } as any;

    // Create a NestJS testing module with the WalletService and its mock providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: AppLoggerService,
          useValue: mockAppLoggerService,
        },
        {
          provide: TokenizationService,
          useValue: mockTokenizationService,
        },
        {
          provide: CurrencyClientService,
          useValue: mockCurrencyClientService,
        },
        {
          provide: WALLET_REPOSITORY_TOKEN,
          useValue: mockWalletRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  /**
   * Test the `create` method.
   */
  describe('create', () => {
    it('should create a new wallet and return the wallet ID', async () => {
      // Arrange
      const input = {
        num: 1234567890,
        balance: BigInt(1000),
        currency: CurrencyEnum.USD,
      };
      const mockCreatedWalletId = '123e4567-e89b-12d3-a456-426614174000';
      mockWalletRepository.createWallet.mockResolvedValue(mockCreatedWalletId);

      // Act
      const result = await service.create(input);

      // Assert
      expect(mockTokenizationService.generateToken).toHaveBeenCalledWith(
        input.num,
      );
      expect(mockWalletRepository.createWallet).toHaveBeenCalledWith({
        tokenId: 'mocked-token-id',
        balance: BigInt(1000),
        currency: CurrencyEnum.USD,
      });
      expect(result).toEqual(mockCreatedWalletId);
    });
  });

  /**
   * Test the `getAll` method.
   */
  describe('getAll', () => {
    it('should return all wallets from the repository', async () => {
      // Arrange
      const mockWallets: Wallet[] = [
        {
          id: 1,
          tokenId: 'token-1',
          balance: BigInt(500),
          currency: CurrencyEnum.USD,
        },
      ];

      mockWalletRepository.getAllWallets.mockResolvedValue(mockWallets);

      // Act
      const result = await service.getAll();

      // Assert

      expect(mockWalletRepository.getAllWallets).toHaveBeenCalled();
      expect(result).toEqual(mockWallets);
    });
  });

  /**
   * Test the `exchange` method.
   */
  describe('exchange', () => {
    // Sample data for a successful exchange scenario
    const mockWallet: Wallet = {
      id: 1,
      tokenId: 'mocked-token',
      balance: BigInt(1000),
      currency: CurrencyEnum.USD,
    };
    const mockExchangeRate: ExchangeRate = {
      from: CurrencyEnum.USD,
      to: CurrencyEnum.EUR,
      rate: 0.9,
    };
    const input = {
      tokenId: 'mocked-token',
      targetCurrency: CurrencyEnum.EUR,
    };

    //   it('should successfully exchange currency and return an ExchangeAttempt', async () => {
    //     // Arrange
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(mockWallet);
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    //     mockCurrencyClientService.getExchangeRate.mockResolvedValue(
    //       mockExchangeRate,
    //     );

    //     // Act
    //     const result = await service.exchange(input);

    //     // Assert
    //     expect(mockWalletRepository.getWalletByTokenId).toHaveBeenCalledWith(
    //       input.tokenId,
    //     );
    //     expect(mockCurrencyClientService.getExchangeRate).toHaveBeenCalledWith(
    //       mockWallet.currency,
    //       input.targetCurrency,
    //     );
    //     expect(result).toEqual({
    //       newCurrency: mockExchangeRate.to,
    //       exchangeRate: mockExchangeRate.rate,
    //       amount: BigInt(900), // 1000 * 0.9 = 900
    //       convertedAt: expect.any(Date),
    //     });
    //   });

    //   it('should throw BadRequestException if wallet balance is zero or negative', async () => {
    //     // Arrange
    //     const walletWithZeroBalance = { ...mockWallet, balance: BigInt(0) };
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(
    //       walletWithZeroBalance,
    //     );

    //     // Act & Assert
    //     await expect(service.exchange(input)).rejects.toThrow(
    //       BadRequestException,
    //     );
    //     await expect(service.exchange(input)).rejects.toThrow(
    //       'Wallet balance below 0: 0. Exchange not permitted.',
    //     );
    //   });

    //   it('should throw BadRequestException if current and target currencies are the same', async () => {
    //     // Arrange
    //     const inputWithSameCurrency = {
    //       ...input,
    //       targetCurrency: CurrencyEnum.USD,
    //     };
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(mockWallet);

    //     // Act & Assert
    //     await expect(service.exchange(inputWithSameCurrency)).rejects.toThrow(
    //       BadRequestException,
    //     );
    //     await expect(service.exchange(inputWithSameCurrency)).rejects.toThrow(
    //       'Current and targetCurrencies are the same the rate will always be 1.00',
    //     );
    //   });

    //   it('should handle currency conversion when `exchangeRate.from` is different from wallet currency', async () => {
    //     // Arrange
    //     const badExchangeRate: ExchangeRate = {
    //       from: CurrencyEnum.EUR,
    //       to: CurrencyEnum.USD,
    //       rate: 1.1,
    //     };
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(mockWallet);
    //     mockCurrencyClientService.getExchangeRate.mockResolvedValue(
    //       badExchangeRate,
    //     );

    //     // Act & Assert
    //     // The private convert method will throw an error, which should be caught by the test
    //     await expect(service.exchange(input)).rejects.toThrow(
    //       "Incorrect wallet's currency for the conversion. Wallet: USD, Rate: EUR.",
    //     );
    //   });
    // });

    // /**
    //  * Test the `delete` method.
    //  */
    // describe('delete', () => {
    //   it('should call the wallet repository to delete a wallet', async () => {
    //     // Arrange
    //     const tokenId = 'test-token-id';
    //     mockWalletRepository.deleteWallet.mockResolvedValue(undefined);

    //     // Act
    //     await service.delete(tokenId);

    //     // Assert
    //     expect(mockWalletRepository.deleteWallet).toHaveBeenCalledWith(tokenId);
    //   });
    // });

    // /**
    //  * Test the `getByTokenId` method.
    //  */
    // describe('getByTokenId', () => {
    //   it('should return a wallet if found', async () => {
    //     // Arrange
    //     const tokenId = 'test-token-id';
    //     const mockWallet: Wallet = {
    //       id: 1,
    //       tokenId,
    //       balance: BigInt(100),
    //       currency: CurrencyEnum.USD,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     };
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(mockWallet);

    //     // Act
    //     const result = await service.getByTokenId(tokenId);

    //     // Assert
    //     expect(mockWalletRepository.getWalletByTokenId).toHaveBeenCalledWith(
    //       tokenId,
    //     );
    //     expect(result).toEqual(mockWallet);
    //   });

    //   it('should throw an error if wallet is not found', async () => {
    //     // Arrange
    //     const tokenId = 'non-existent-token';
    //     mockWalletRepository.getWalletByTokenId.mockResolvedValue(null);

    //     // Act & Assert
    //     await expect(service.getByTokenId(tokenId)).rejects.toThrowError(
    //       'wallet with token: non-existent-token not found',
    //     );
    //   });
  });
});
