import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreditCardDto } from '../../../shared/dto/credit-card.dto';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { CurrencyValidationPipe } from '../../../shared/pipes/currencyValidation.pipe';
import { ApiRoutes, WalletRoutes } from '../../../shared/router/routes';
import { CurrencyEnum } from '../../../shared/validations/currency';
import type { CreditCard, UpdateBalanceInput } from '../app/input';
import { ExchangeAttempt, FundsInWallet } from '../app/output';
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
  async createWallet(
    @Body(new ValidationPipe()) input: CreditCardDto,
  ): Promise<{ tokenId: string }> {
    this.logger.debug(this.logPrefix, 'Creating wallet.');
    const creditCard: CreditCard = {
      num: Number(input.cardNumber),
      currency: input.currency,
    };
    const tokenId: string = await this.walletService.create(creditCard);
    return { tokenId: tokenId };
  }

  @Patch(WalletRoutes.UPDATE)
  async updateWalletBalance(
    @Body() input: UpdateBalanceInput,
  ): Promise<FundsInWallet> {
    const funds = await this.walletService.updateBalance(
      input.tokenId,
      input.balance,
    );
    return funds;
  }

  @Delete(WalletRoutes.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(@Param('tokenId') tokenId: string): Promise<void> {
    await this.walletService.delete(tokenId);
  }

  @Get(WalletRoutes.EXCHANGE)
  @HttpCode(HttpStatus.OK)
  async getExchangeRate(
    @Query('targetCurrency', CurrencyValidationPipe)
    targetCurrency: CurrencyEnum,
    @Query('tokenId') tokenId: string,
  ): Promise<ExchangeAttempt> {
    this.logger.debug(
      this.logPrefix,
      `tokenId: ${tokenId} CUR: ${targetCurrency}`,
    );
    const attempt = await this.walletService.exchange({
      tokenId,
      targetCurrency,
    });
    return attempt;
  }
}
