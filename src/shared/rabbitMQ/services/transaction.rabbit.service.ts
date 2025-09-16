import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Transaction } from '../../../modules/transaction/domain/transaction.entity';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { RabbitClientNames, RabbitQueues } from '../rabbit.enum';
import { TransactionEvent } from './transaction.request.event.input';

@Injectable()
export class TransactionRabbitService implements OnModuleInit {
  constructor(
    @Inject(RabbitClientNames.TRANSACTION_CLIENT) private client: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }

  async onModuleInit() {
    await this.client.connect();
  }

  sendTrxRequest(transaction: Transaction): TransactionEvent {
    try {
      const eventInput = this.mapTransactionToEvent(transaction);
      this.client.emit(RabbitQueues.REQ, {
        eventInput,
      });
      this.logger.log(
        this.logPrefix,
        `Successfully sent an event ${JSON.stringify(eventInput)} to "${RabbitQueues.REQ}" queue using ${RabbitClientNames.TRANSACTION_CLIENT} client.`,
      );
      return eventInput;
    } catch (error) {
      this.logger.error(
        this.logPrefix,
        `Error sending transaction complete message for transactionId: ${transaction.id}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async processTransactionResponse(message: {
    transactionId: string;
    status: string;
  }) {
    this.logger.debug(
      this.logPrefix,
      `Processing transaction response for transactionId: ${message.transactionId} with status: ${message.status}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Here you can add logic to process the response message as needed
  }

  private mapTransactionToEvent(transaction: Transaction): TransactionEvent {
    const input: TransactionEvent = {
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currentCurrency,
      status: transaction.status,
      originCreatedAt: transaction.clientTransactionDate
        ? transaction.clientTransactionDate
        : new Date(),
    };
    return input;
  }
}
