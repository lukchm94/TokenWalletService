import { InjectionToken } from '@nestjs/common';
import { CurrencyEnum } from '../../../shared/validations/currency';
import { CreateWalletInput } from '../app/input';
import { FundsInWallet } from '../app/output';
import { Wallet } from '../domain/wallet.entity';

export interface WalletRepository {
  createWallet(input: CreateWalletInput): Promise<string>;
  getWalletByTokenId(tokenId: string): Promise<Wallet | null>;
  getAllWallets(): Promise<Wallet[]>;
  updateWalletBalance(
    tokenId: string,
    balance: bigint,
    currency?: CurrencyEnum,
  ): Promise<FundsInWallet>;
  deleteWallet(tokenId: string): Promise<void>;
}

export const WALLET_REPOSITORY_TOKEN: InjectionToken<WalletRepository> =
  'WalletRepository';
