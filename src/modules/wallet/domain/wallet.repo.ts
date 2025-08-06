import { InjectionToken } from '@nestjs/common';
import { CreateWalletInput } from '../app/useCase/createWallet/input';
import { Wallet } from '../domain/wallet.entity';

export interface WalletRepository {
  createWallet(input: CreateWalletInput): Promise<string>;
  getWalletByTokenId(tokenId: string): Promise<Wallet | null>;
  getAllWallets(): Promise<Wallet[]>;
  updateWalletBalance(tokenId: string, balance: number): Promise<void>;
  deleteWallet(tokenId: string): Promise<void>;
}

export const WALLET_REPOSITORY_TOKEN: InjectionToken<WalletRepository> =
  'WalletRepository';
