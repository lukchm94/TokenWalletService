import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FundsInWallet } from 'src/modules/wallet/app/output';
import { AppLoggerService } from '../../../../../shared/logger/app-logger.service';
import { CreateWalletInput } from '../../../app/input';
import { Wallet } from '../../../domain/wallet.entity';
import { WalletRepository } from '../../../domain/wallet.repo';
import { WalletDao } from '../wallet.dao';

const WALLET_FILE_PATH: string = path.join(
  __dirname,
  '../../../../../shared/localDb/wallets.json',
);

@Injectable()
export class WalletRepositoryImpl implements WalletRepository {
  private readonly filePath: string = WALLET_FILE_PATH;
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(private readonly logger: AppLoggerService) {}

  async createWallet(input: CreateWalletInput): Promise<string> {
    const wallets: Map<string, Wallet> = await this.loadWallets();
    const walletId = await this.getId();
    const wallet = Wallet.create({
      id: walletId,
      tokenId: input.tokenId,
      balance: input.balance,
      currency: input.currency,
    });
    wallets.set(wallet.tokenId, wallet);
    await this.saveToJSON(wallets);
    return wallet.tokenId;
  }

  async getWalletByTokenId(tokenId: string): Promise<Wallet | null> {
    const wallets = await this.loadWallets();
    return wallets.get(tokenId) || null;
  }

  async getAllWallets(): Promise<Wallet[]> {
    const wallets = await this.loadWallets();
    return [...wallets.values()];
  }

  async updateWalletBalance(
    tokenId: string,
    balance: bigint,
  ): Promise<FundsInWallet> {
    const wallets = await this.loadWallets();
    const wallet = wallets.get(tokenId);
    if (!wallet) {
      throw new Error(`No wallet found for TokenID: ${tokenId}`);
    }
    wallet.balance = balance;
    wallets.delete(tokenId);
    const updatedWallets = wallets;
    updatedWallets.set(wallet?.tokenId, wallet);
    await this.saveToJSON(updatedWallets);
    return {
      tokenId: wallet.tokenId,
      oldBalance: wallet.balance - balance,
      currentBalance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async deleteWallet(tokenId: string): Promise<void> {
    const wallets = await this.loadWallets();
    wallets.delete(tokenId);
    await this.saveToJSON(wallets);
  }

  private async saveToJSON(wallets: Map<string, Wallet>): Promise<void> {
    const walletsDao = Array.from(wallets.values()).map((w) => ({
      id: w.id,
      tokenId: w.tokenId,
      balance: w.balance,
      currency: w.currency,
    }));
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(walletsDao, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.log(this.logPrefix, `Error saving wallets to file: ${error}`);
      throw new Error('Failed to save wallets to file.');
    }
  }

  private async loadWallets(): Promise<Map<string, Wallet>> {
    this.logger.debug(this.logPrefix, 'Loading available wallets');
    try {
      await fs.access(this.filePath);
      const data = await fs.readFile(this.filePath, 'utf-8');

      const raw: WalletDao[] = JSON.parse(data) as WalletDao[];
      if (!Array.isArray(raw)) {
        this.logger.warn(
          this.logPrefix,
          `Wallets file content is not an array. Initializing with empty map. Content: ${data}`,
        );
        return new Map();
      }
      const walletMap = new Map<string, Wallet>();
      raw.forEach((val: WalletDao) => {
        if (this.checkElements(val)) {
          const wallet = this.walletFromDao(val);
          walletMap.set(wallet.tokenId, wallet);
        } else {
          this.logger.warn(
            this.logPrefix,
            `Invalid wallet data found in file: ${JSON.stringify(val)}. Skipping.`,
          );
        }
      });

      this.logger.log(this.logPrefix, `Found wallets: ${walletMap.size}`);
      return walletMap;
    } catch (err) {
      this.logger.error(this.logPrefix, `Error loading wallets: ${err}`);
      return new Map();
    }
  }

  private async getId(): Promise<number> {
    const wallets = await this.loadWallets();
    if (wallets.size === 0) {
      return 1000;
    }

    const maxId = Array.from(wallets.values()).reduce((max, wallet) => {
      return wallet.id > max ? wallet.id : max;
    }, 0);

    return Math.max(maxId + 1, 1000);
  }

  private walletFromDao(val: WalletDao): Wallet {
    return Wallet.create({
      id: val.id,
      tokenId: val.tokenId,
      balance: val.balance,
      currency: val.currency,
    });
  }

  private checkElements(val: WalletDao): boolean {
    return (
      val &&
      typeof val.id === 'number' &&
      typeof val.tokenId === 'string' &&
      typeof val.balance === 'number' &&
      typeof val.currency === 'string'
    );
  }
}
