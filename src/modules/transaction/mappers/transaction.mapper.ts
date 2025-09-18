import { Injectable } from '@nestjs/common';
import { TransactionResponseEvent } from '../../../modules/rabbitMQ/services/interfaces/transaction.response.event.input';
import { TransactionWebhookDto } from '../../../shared/dto/transaction-webhook-payload.dto';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import {
  TRANSACTION_STATUS_TYPE,
  TransactionStatusEnum,
  TransactionStatusType,
  validTransactionStatuses,
} from '../../../shared/validations/transaction/status';
import { UpdateTransactionInput } from '../app/input';

@Injectable()
export default class TransactionMapper {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }

  constructor(private readonly appLogger: AppLoggerService) {}

  public fromWebhookToUpdateTrxInput(
    webhookDto: TransactionWebhookDto,
  ): UpdateTransactionInput {
    this.appLogger.log(
      this.logPrefix,
      `Converting TransactionWebhookDto: ${JSON.stringify(webhookDto)} to UpdateTransactionInput`,
    );
    return {
      transactionId: webhookDto.id,
      status: webhookDto.status,
    };
  }

  public fromEventToUpdateTrxInput(
    event: TransactionResponseEvent,
  ): UpdateTransactionInput {
    this.appLogger.log(
      this.logPrefix,
      `Converting TransactionResponseEvent: ${JSON.stringify(event)} to UpdateTransactionInput`,
    );
    const statusEnum = this.convertStatusToEnum(event.data.status);
    return {
      transactionId: event.data.id,
      status: statusEnum,
    };
  }

  private convertStatusToEnum(status: string): TransactionStatusEnum {
    if (!TRANSACTION_STATUS_TYPE.includes(status as TransactionStatusType)) {
      throw new Error(
        `Invalid transaction status: ${status}. Allowed transaction types: ${JSON.stringify(validTransactionStatuses)}`,
      );
    }
    return status as TransactionStatusEnum;
  }
}
