import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { WalletRepository } from '../../../../wallet/domain/wallet.repo';
import { CreateWalletInput } from '../../../app/input';
import { FundsInWallet } from '../../../app/output';
import { Wallet } from '../../../domain/wallet.entity';
import { WalletMapper } from '../mappers/wallet.mapper';
import { WalletDao } from '../wallet.dao';

@Injectable()
export class WalletRepositoryImpl implements WalletRepository {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly prismaDb: PrismaService,
    private readonly mapper: WalletMapper,
  ) {}

  async createWallet(input: CreateWalletInput): Promise<string> {
    this.logger.debug(
      this.logPrefix,
      `Attempting to create a wallet: ${JSON.stringify(input)}`,
    );
    const result = await this.prismaDb.wallet.create({ data: input });
    if (!result) {
      this.logger.warn(
        this.logPrefix,
        `Error saving the wallet with params: ${JSON.stringify(input)}`,
      );
      throw new Error(`Error saving the wallet: ${JSON.stringify(input)}`);
    }
    this.logger.log(this.logPrefix, 'Saved wallet');
    return result.tokenId;
  }

  async getWalletByTokenId(tokenId: string): Promise<Wallet | null> {
    const walletDao = await this.prismaDb.wallet.findFirst({
      where: { tokenId: tokenId },
    });
    if (!walletDao) {
      this.logger.log(
        this.logPrefix,
        `No wallet found with the TokenId: ${tokenId}`,
      );
      return null;
    } else {
      return this.mapper.fromDaoToObject(walletDao);
    }
  }

  async getAllWallets(): Promise<Wallet[]> {
    const walletsDao: WalletDao[] = await this.prismaDb.wallet.findMany();
    this.logger.log(
      this.logPrefix,
      `Found ${walletsDao.length} wallets in the database.`,
    );
    const wallets: Wallet[] = [];
    walletsDao.forEach((walletDao: WalletDao) => {
      this.logger.log(
        this.logPrefix,
        `INSIDE THE FOR LOOP: ${JSON.stringify(walletDao)}`,
      );
      wallets.push(this.mapper.fromDaoToObject(walletDao));
    });
    return wallets;
  }

  async updateWalletBalance(
    tokenId: string,
    balance: number,
  ): Promise<FundsInWallet> {
    this.logger.debug(
      this.logPrefix,
      `Updating wallet: ${tokenId}, with ${balance}`,
    );

    const wallet = await this.getWalletByTokenId(tokenId);
    if (!wallet) {
      throw new Error(`Wallet with tokenId: ${tokenId} does not exists.`);
    }
    const updatedWallet: WalletDao = await this.prismaDb.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: balance,
        },
      },
    });

    this.logger.log(
      this.logPrefix,
      `Wallet for tokenId: ${updatedWallet.tokenId} successfully updated. Current balance: ${updatedWallet.balance} ${updatedWallet.currency}`,
    );

    const funds: FundsInWallet = {
      tokenId: updatedWallet.tokenId,
      oldBalance: wallet.balance,
      currentBalance: updatedWallet.balance,
      currency: wallet.currency,
    };

    return funds;
  }

  async deleteWallet(tokenId: string): Promise<void> {
    const wallet = await this.getWalletByTokenId(tokenId);
    if (!wallet) {
      throw new Error(`Wallet with tokenId: ${tokenId} does not exists.`);
    }

    await this.prismaDb.wallet.delete({ where: { id: wallet.id } });
    this.logger.debug(
      this.logPrefix,
      `Successfully deleted wallet: ${tokenId}`,
    );
  }
}
