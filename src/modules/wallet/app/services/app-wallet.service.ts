import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ExchangeRate } from '../../../../shared/clients/currencyExchange/output';
import { CurrencyClientService } from '../../../../shared/clients/currencyExchange/services/currency.service';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { CurrencyEnum } from '../../../../shared/validations/currency';
import { Wallet } from '../../domain/wallet.entity';
import type { WalletRepository } from '../../domain/wallet.repo';
import { WALLET_REPOSITORY_TOKEN } from '../../domain/wallet.repo';
import { CreditCard, TriggerExchange } from '../input';
import { ExchangeAttempt, FundsInWallet } from '../output';
import { TokenizationService } from './tokenization.service';

@Injectable()
export class WalletService {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly tokenService: TokenizationService,
    private readonly currencyClientService: CurrencyClientService,
    @Inject(WALLET_REPOSITORY_TOKEN)
    private readonly repo: WalletRepository,
  ) {}

  public async create(input: CreditCard): Promise<string> {
    this.logger.debug(
      this.logPrefix,
      `Calling create wallet in a service with input: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
    const tokenId = this.tokenService.generateToken(input.num);
    const createdWalletId = await this.repo.createWallet({
      tokenId,
      balance: this.getBalance(input.balance),
      currency: input.currency,
    });
    return createdWalletId;
  }

  public async getAll(): Promise<Wallet[]> {
    this.logger.debug(this.logPrefix, 'Getting all wallets from the service');
    const wallets = await this.repo.getAllWallets();
    return wallets;
  }

  public async updateBalance(
    tokenId: string,
    balance: bigint,
    currency?: CurrencyEnum,
  ): Promise<FundsInWallet> {
    const funds = await this.repo.updateWalletBalance(
      tokenId,
      balance,
      currency,
    );

    return funds;
  }

  public async getByTokenId(tokenId: string): Promise<Wallet> {
    const wallet = await this.repo.getWalletByTokenId(tokenId);
    if (!wallet) {
      throw new Error(
        `${this.logPrefix} wallet with token: ${tokenId} not found`,
      );
    }
    return wallet;
  }

  public async delete(tokenId: string): Promise<void> {
    await this.repo.deleteWallet(tokenId);
  }

  public async exchange(input: TriggerExchange): Promise<ExchangeAttempt> {
    const wallet = await this.getByTokenId(input.tokenId);
    if (wallet.balance <= 0) {
      const balanceError = `Wallet balance below 0: ${wallet.balance}. Exchange not permitted.`;
      this.logger.error(this.logPrefix, balanceError);
      throw new BadRequestException(balanceError);
    }
    if (wallet.currency === input.targetCurrency) {
      const exchangeError =
        'Current and targetCurrencies are the same the rate will always be 1.00';
      this.logger.error(this.logPrefix, exchangeError);
      throw new BadRequestException(exchangeError);
    }
    const rate: ExchangeRate = await this.currencyClientService.getExchangeRate(
      wallet.currency,
      input.targetCurrency,
    );
    const attempt = this.convert(wallet, rate);
    return attempt;
  }

  public async getByWalletId(walletId: number): Promise<Wallet> {
    const wallet = await this.repo.getById(walletId);
    return wallet;
  }

  private convert(wallet: Wallet, exchangeRate: ExchangeRate): ExchangeAttempt {
    if (wallet.currency !== exchangeRate.from) {
      const currencyError = `Incorrect wallet's currency for the conversion. Wallet: ${wallet.currency}, Rate: ${exchangeRate.from}.`;
      this.logger.error(this.logPrefix, currencyError);
      throw new Error(currencyError);
    }
    const rateAsBigInt = BigInt(Math.round(exchangeRate.rate * 100));
    const exchangedBalance = (wallet.balance * rateAsBigInt) / 100n;
    const attempt: ExchangeAttempt = {
      newCurrency: exchangeRate.to,
      exchangeRate: exchangeRate.rate,
      amount: exchangedBalance,
      convertedAt: new Date(),
    };
    return attempt;
  }

  private getBalance(balance?: bigint): bigint {
    if (!balance) {
      return BigInt(0);
    }
    return balance;
  }
}
