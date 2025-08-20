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
      throw new Error();
    }
    const transactionInput = this.buildTransactionInput(wallet, input);
    const transaction = await this.transactionService.create(transactionInput);

    if (!wallet) {
      throw new Error();
    }
    const fundsInWallet = await this.updateWallet(wallet, transaction);
    return fundsInWallet;
  }

  private async updateWallet(
    wallet: Wallet,
    transaction: Transaction,
  ): Promise<FundsInWallet> {
    this.logger.debug(
      this.logPrefix,
      `Updating wallet: ${JSON.stringify(wallet, jsonStringifyReplacer)} with transaction: ${JSON.stringify(transaction, jsonStringifyReplacer)}`,
    );
    if (transaction.type === TransactionTypeEnum.EXCHANGE) {
      return await this.exchange(wallet, transaction);
    }
    if (
      transaction.type === TransactionTypeEnum.DEPOSIT ||
      transaction.type === TransactionTypeEnum.WITHDRAWAL
    ) {
      return await this.walletService.updateBalance(
        wallet.tokenId,
        transaction.amount,
        wallet.currency,
      );
    }
    throw new Error();
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
    const type = this.getTransactionType(
      wallet.currency,
      input.amount,
      input.targetCurrency,
    );

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
}
