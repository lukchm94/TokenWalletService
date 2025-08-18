import { Inject, Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { Wallet } from '../../domain/wallet.entity';
import type { WalletRepository } from '../../domain/wallet.repo';
import { WALLET_REPOSITORY_TOKEN } from '../../domain/wallet.repo';
import { CreditCard } from '../input';
import { TokenizationService } from './tokenization.service';

@Injectable()
export class WalletService {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly tokenService: TokenizationService,
    @Inject(WALLET_REPOSITORY_TOKEN)
    private readonly repo: WalletRepository,
  ) {}

  public async create(input: CreditCard): Promise<string> {
    this.logger.debug(
      this.logPrefix,
      `Calling create wallet in a service with input: ${JSON.stringify(input)}`,
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

  public async updateBalance(tokenId: string, balance: number): Promise<void> {
    await this.repo.updateWalletBalance(tokenId, balance);
  }

  public async delete(tokenId: string): Promise<void> {
    await this.repo.deleteWallet(tokenId);
  }

  private getBalance(balance?: number): number {
    if (!balance) {
      return 0;
    }
    return balance;
  }
}
