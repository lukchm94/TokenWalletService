import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { GatewayOutput } from 'src/modules/gateway/api/output';
import { TransactionWebhookDto } from 'src/shared/dto/transaction-webhook-payload.dto';
import { FundsRepresentation } from '../../../modules/wallet/api/representation';
import { CreateTransactionDto } from '../../../shared/dto/create-transaction.dto';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { ApiRoutes, TransactionRoutes } from '../../../shared/router/routes';
import { jsonStringifyReplacer } from '../../../shared/utils/json.utils';
import { CancelTransactionUseCase } from '../app/cancel-transaction-use-case/cancel-transaction.use-case';
import { CompleteTransactionUseCase } from '../app/complete-transaction-use-case/complete-transaction.use-case';
import { CreateTransactionUseCase } from '../app/create-transaction-use-case/create-transaction.use-case';
import { CreateTransactionInput } from '../app/input';
import { UpdateTransactionFromWebhookUseCase } from '../app/update-transaction-from-webhook-use-case/update-transaction-from-webhook.use-case';
import { TransactionService } from '../domain/services/transaction.service';
import { Transaction } from '../domain/transaction.entity';
import { TransactionRepresentation } from './representation';
import { TransactionRepresentationMapper } from './representationMapper';

@Controller(ApiRoutes.TRANSACTION)
export class TransactionController {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly completeTransactionUseCase: CompleteTransactionUseCase,
    private readonly transactionRepresentationMapper: TransactionRepresentationMapper,
    private readonly cancelTransactionUseCase: CancelTransactionUseCase,
    private readonly updateTransactionFromWebhookUseCase: UpdateTransactionFromWebhookUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveTransaction(
    @Body(new ValidationPipe()) input: CreateTransactionDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
  ): Promise<FundsRepresentation> {
    this.logger.debug(
      this.logPrefix,
      `Creating the transaction use case: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );

    if (!idempotencyKey) {
      const err = 'Required Idempotency-Key header is missing.';
      this.logger.error(this.logPrefix, err);
      throw new BadRequestException(err);
    }
    const transactionInput: CreateTransactionInput = {
      tokenId: input.tokenId,
      amount: input.amount,
      targetCurrency: input.currency,
      clientTransactionDate: input.clientTransactionDate,
      idempotencyKey,
    };
    const fundsInWallet =
      await this.createTransactionUseCase.run(transactionInput);
    return {
      tokenId: fundsInWallet.tokenId,
      oldBalance: Number(fundsInWallet.oldBalance),
      currentBalance: Number(fundsInWallet.currentBalance),
      currency: fundsInWallet.currency,
    };
  }

  @Get(TransactionRoutes.COMPLETE)
  @HttpCode(HttpStatus.OK)
  async getTransactions(
    @Param('walletId', ParseIntPipe) walletId: number,
  ): Promise<{
    elements: number;
    data: TransactionRepresentation[];
  }> {
    this.logger.log(
      this.logPrefix,
      `Getting all transactions for wallet: ${walletId}`,
    );
    const transactions: Transaction[] =
      await this.transactionService.getAllTransactionsByWallet(walletId);

    const transactionRepresentation: TransactionRepresentation[] =
      transactions.map((transaction: Transaction) =>
        this.transactionRepresentationMapper.getTransaction(transaction),
      );
    return {
      elements: transactionRepresentation.length,
      data: transactionRepresentation,
    };
  }

  @Post(TransactionRoutes.COMPLETE)
  @HttpCode(HttpStatus.OK)
  async completeTransactions(
    @Param('walletId', ParseIntPipe) walletId: number,
  ): Promise<{ elements: number; data: GatewayOutput[] }> {
    this.logger.log(
      this.logPrefix,
      `Completing all transactions for wallet: ${walletId}`,
    );
    const results = await this.completeTransactionUseCase.run(walletId);
    return { elements: results.length, data: results };
  }

  @Patch(TransactionRoutes.CANCEL)
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ): Promise<TransactionRepresentation> {
    const result = await this.cancelTransactionUseCase.run(transactionId);
    return result;
  }

  @Post(TransactionRoutes.WEBHOOK)
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    input: TransactionWebhookDto,
  ): Promise<void> {
    try {
      this.logger.log(
        this.logPrefix,
        `Webhook called with input: ${JSON.stringify(input, jsonStringifyReplacer)}`,
      );
      const transaction =
        await this.updateTransactionFromWebhookUseCase.run(input);
      this.logger.log(
        this.logPrefix,
        `Processes transaction: ${JSON.stringify(transaction, jsonStringifyReplacer)}`,
      );
    } catch (error) {
      this.logger.error(
        this.logPrefix,
        `Error processing webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(this.logPrefix, error.stack);
      }
      throw error;
    }
  }
}
