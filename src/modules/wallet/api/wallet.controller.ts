import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { ApiRoutes } from 'src/shared/router/routes';
import { WalletService } from '../app/app-wallet.service';
import type { CreateWalletInput } from '../app/useCase/createWallet/input';
import { Wallet } from '../domain/wallet.entity';

@Controller(ApiRoutes.WALLET)
export class WalletController {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(
    private readonly walletService: WalletService,
    private readonly logger: AppLoggerService,
  ) {}

  @Get()
  async allWallets(): Promise<{ data: Wallet[] }> {
    this.logger.debug(this.logPrefix, 'Getting all wallets.');
    const wallets = await this.walletService.getAll();
    return { data: wallets };
  }

  @Post()
  async createWallet(
    @Body() input: CreateWalletInput,
  ): Promise<{ tokenId: string }> {
    this.logger.debug(this.logPrefix, 'Creating wallet.');
    const tokenId: string = await this.walletService.create(input);
    return { tokenId: tokenId };
  }
}
