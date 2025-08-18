import { Inject, Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { Wallet } from '../domain/wallet.entity';
import type { WalletRepository } from '../domain/wallet.repo';
import { WALLET_REPOSITORY_TOKEN } from '../domain/wallet.repo';
import { CreateWalletInput } from './useCase/createWallet/input';

@Injectable()
export class WalletService {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(WALLET_REPOSITORY_TOKEN)
    private readonly repo: WalletRepository,
  ) {}

  public async create(input: CreateWalletInput): Promise<string> {
    this.logger.debug(
      this.logPrefix,
      `Calling create wallet in a service with input: ${JSON.stringify(input)}`,
    );
    const tokenId = await this.repo.createWallet(input);
    return tokenId;
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
}
