import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreditCardDto } from '../../../shared/dto/credit-card.dto';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { CurrencyValidationPipe } from '../../../shared/pipes/currencyValidation.pipe';
import { ApiRoutes, WalletRoutes } from '../../../shared/router/routes';
import { CurrencyEnum } from '../../../shared/validations/currency';
import type { CreditCard } from '../app/input';
import { WalletService } from '../app/services/app-wallet.service';
import { Wallet } from '../domain/wallet.entity';
import { ExchangeRepresentation, WalletRepresentation } from './representation';

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
  async allWallets(): Promise<{
    elements: number;
    data: WalletRepresentation[];
  }> {
    this.logger.debug(this.logPrefix, 'Getting all wallets.');
    const wallets = await this.walletService.getAll();
    const walletRepresentations: WalletRepresentation[] = wallets.map(
      (wallet: Wallet) => ({
        id: wallet.id,
        tokenId: wallet.tokenId,
        balance: Number(wallet.balance),
        currency: wallet.currency,
      }),
    );
    return {
      elements: walletRepresentations.length,
      data: walletRepresentations,
    };
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
  ): Promise<ExchangeRepresentation> {
    this.logger.debug(
      this.logPrefix,
      `tokenId: ${tokenId} CUR: ${targetCurrency}`,
    );
    const attempt = await this.walletService.exchange({
      tokenId,
      targetCurrency,
    });
    return {
      newCurrency: attempt.newCurrency,
      exchangeRate: attempt.exchangeRate,
      amount: Number(attempt.amount),
      convertedAt: attempt.convertedAt,
    };
  }
}
