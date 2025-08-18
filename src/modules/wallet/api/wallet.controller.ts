import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { ApiRoutes, WalletRoutes } from 'src/shared/router/routes';
import { CurrencyEnum, validCurrencies } from 'src/shared/validations/currency';
import type { CreditCard, UpdateBalanceInput } from '../app/input';
import { WalletService } from '../app/services/app-wallet.service';
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
  async allWallets(): Promise<{ elements: number; data: Wallet[] }> {
    this.logger.debug(this.logPrefix, 'Getting all wallets.');
    const wallets = await this.walletService.getAll();
    return { elements: wallets.length, data: wallets };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() input: CreditCard): Promise<{ tokenId: string }> {
    this.logger.debug(this.logPrefix, 'Creating wallet.');
    if (!validCurrencies.includes(input.currency as CurrencyEnum)) {
      this.logger.warn(
        this.logPrefix,
        `Invalid currency code: ${input.currency}`,
      );
      const err = new BadRequestException(
        `Invalid currency type: ${input.currency}. Valid currencies are: ${validCurrencies.join(', ')}`,
      );
      throw err;
    }
    const tokenId: string = await this.walletService.create(input);
    return { tokenId: tokenId };
  }

  @Patch(WalletRoutes.UPDATE)
  async updateWalletBalance(@Body() input: UpdateBalanceInput): Promise<void> {
    await this.walletService.updateBalance(input.tokenId, input.balance);
  }

  @Delete(WalletRoutes.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(@Param('tokenId') tokenId: string): Promise<void> {
    await this.walletService.delete(tokenId);
  }
}
