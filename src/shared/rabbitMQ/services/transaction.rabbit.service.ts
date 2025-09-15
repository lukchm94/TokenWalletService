/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { TransactionStatusEnum } from '../../../shared/validations/transaction/status';
import { RabbitClientNames, RabbitQueues } from '../rabbit.enum';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.client.connect();
  }

  sendTransactionCompleteMessage(transactionId: string): {
    message: string;
    transactionId: string;
  } {
    // TODO: Implement proper logic for sending transaction complete message
    this.logger.debug(
      this.logPrefix,
      `Sending transaction complete message for transactionId: ${transactionId}`,
    );
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.client!.emit(RabbitQueues.REQ, {
        transactionId,
        status: TransactionStatusEnum.PENDING,
      });
      return { message: 'Transaction sent for validation', transactionId };
    } catch (error) {
      this.logger.error(
        this.logPrefix,
        `Error sending transaction complete message for transactionId: ${transactionId}`,
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
}
