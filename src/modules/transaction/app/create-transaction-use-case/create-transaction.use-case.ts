import { BadRequestException, Injectable } from '@nestjs/common';
import { jsonStringifyReplacer } from 'src/shared/utils/json.utils';
import { TriggerExchange } from '../../../../modules/wallet/app/input';
import {
  ExchangeAttempt,
  FundsInWallet,
} from '../../../../modules/wallet/app/output';
import { WalletService } from '../../../../modules/wallet/app/services/app-wallet.service';
import { Wallet } from '../../../../modules/wallet/domain/wallet.entity';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { CurrencyEnum } from '../../../../shared/validations/currency';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { TransactionTypeEnum } from '../../../../shared/validations/transaction/type';
import { Transaction } from '../../domain/transaction.entity';
import { CreateTransactionInput, TransactionInput } from '../input';
import { TransactionService } from '../services/transaction.service';

@Injectable()
export class CreateTransactionUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(
    private readonly logger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  public async run(input: CreateTransactionInput): Promise<FundsInWallet> {
    this.logger.log(
      this.logPrefix,
      `Attempting to save transaction: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );

    const wallet = await this.walletService.getByTokenId(input.tokenId);

    if (!wallet) {
      this.throwError(input);
    }
    const transactionInput = this.buildTransactionInput(wallet, input);
    const transaction = await this.transactionService.create(transactionInput);

    if (
      transaction.status === TransactionStatusEnum.COMPLETED &&
      transaction.type === TransactionTypeEnum.EXCHANGE
    ) {
      const fundsInWallet = await this.exchange(wallet, transaction);
      return fundsInWallet;
    }
    this.logger.log(
      this.logPrefix,
      `Created transaction: ${JSON.stringify(transaction, jsonStringifyReplacer)}. Use api/transaction/complete to complete transaction`,
    );
    return {
      tokenId: wallet.tokenId,
      oldBalance: wallet.balance,
      currentBalance: wallet.balance + transaction.amount,
      currency: transaction.currentCurrency,
    };
  }

  private async exchange(
    wallet: Wallet,
    transaction: Transaction,
  ): Promise<FundsInWallet> {
    const triggerExchange: TriggerExchange = {
      tokenId: wallet.tokenId,
      targetCurrency: transaction.currentCurrency,
    };
    const exchange: ExchangeAttempt =
      await this.walletService.exchange(triggerExchange);

    const exchangedWallet = await this.walletService.updateBalance(
      wallet.tokenId,
      exchange.amount,
      exchange.newCurrency,
    );
    this.logger.log(
      this.logPrefix,
      `Successfully completed the exchange for a wallet: ${JSON.stringify(exchangedWallet, jsonStringifyReplacer)}`,
    );
    return exchangedWallet;
  }

  private buildTransactionInput(
    wallet: Wallet,
    input: CreateTransactionInput,
  ): TransactionInput {
    if (
      wallet.currency === input.targetCurrency &&
      Number(input.amount) === 0
    ) {
      const err = `Requested to change created transaction for: ${Number(input.amount)} for currency: ${input.targetCurrency} which is the same as ${wallet.currency}. No action needed.`;
      this.logger.error(this.logPrefix, err);
      throw new BadRequestException(err);
    }
    const type = this.getTransactionType(
      wallet.currency,
      input.amount,
      input.targetCurrency,
    );

    if (type === TransactionTypeEnum.EXCHANGE && Number(input.amount) !== 0) {
      const err = `For ${type} transaction amount must be 0, but received: ${Number(input.amount)}`;
      this.logger.error(this.logPrefix, err);
      throw new BadRequestException(err);
    }
    const transactionInput: TransactionInput = {
      walletId: wallet.id,
      type: type,
      status:
        type === TransactionTypeEnum.EXCHANGE
          ? TransactionStatusEnum.COMPLETED
          : TransactionStatusEnum.PENDING,
      originCurrency: wallet.currency,
      currentCurrency: input.targetCurrency,
      amount: input.amount,
    };
    return transactionInput;
  }
  private getTransactionType(
    walletCurrency: CurrencyEnum,
    amount: bigint,
    targetCurrency: CurrencyEnum,
  ): TransactionTypeEnum {
    if (walletCurrency !== targetCurrency) {
      return TransactionTypeEnum.EXCHANGE;
    }

    if (amount > 0) {
      return TransactionTypeEnum.DEPOSIT;
    }
    if (amount < 0) {
      return TransactionTypeEnum.WITHDRAWAL;
    }
    throw new BadRequestException(
      'Invalid combination of currencies and balance. Unable to create transaction',
    );
  }

  private throwError(input: CreateTransactionInput): void {
    throw new BadRequestException(
      `No wallet found for input: ${JSON.stringify(input, jsonStringifyReplacer)}`,
    );
  }
}
