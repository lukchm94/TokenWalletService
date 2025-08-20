import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { FundsRepresentation } from '../../../modules/wallet/api/representation';
import { CreateTransactionDto } from '../../../shared/dto/create-transaction.dto';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { ApiRoutes } from '../../../shared/router/routes';
import { jsonStringifyReplacer } from '../../../shared/utils/json.utils';
import { CreateTransactionUseCase } from '../app/create-transaction-use-case/create-transaction.use-case';
import { CreateTransactionInput } from '../app/input';

@Controller(ApiRoutes.TRANSACTION)
export class TransactionController {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(
    private readonly logger: AppLoggerService,
    // private readonly transactionService: TransactionService,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveTransaction(
    @Body(new ValidationPipe()) input: CreateTransactionDto,
  ): Promise<FundsRepresentation> {
    this.logger.debug(
      this.logPrefix,
      `Creating the transaction use case: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
    const transactionInput: CreateTransactionInput = {
      tokenId: input.tokenId,
      amount: input.amount,
      targetCurrency: input.currency,
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

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async getTransactions(@Body()): Promise<Transaction[]> {
  //   const transactions = await this.transactionService.update()
  // }
}
