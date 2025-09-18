import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { TransactionEvent } from '../../../modules/rabbitMQ/services/interfaces/transaction.request.event.input';
import { TransactionRabbitService } from '../../../modules/rabbitMQ/services/transaction.rabbit.service';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { RabbitQueues } from '../../rabbitMQ/rabbit.enum';
import { UpdateTransactionGatewayResponseUseCase } from '../app/update-transaction-gateway-response-use-case/update-transaction-gateway-response.use-case';
import { UpdateSourceEnum } from '../app/update-transaction-gateway-response-use-case/update.source.enum';
import TransactionMapper from '../mappers/transaction.mapper';

@Controller()
export class RabbitController {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(
    private readonly appLogger: AppLoggerService,
    private readonly rabbitService: TransactionRabbitService,
    private readonly updateTrxGatewayResponseUseCase: UpdateTransactionGatewayResponseUseCase,
    private readonly mapper: TransactionMapper,
  ) {}

  @EventPattern(RabbitQueues.RES)
  async handleTransactionResponse(@Payload() data: TransactionEvent) {
    this.appLogger.log(
      this.logPrefix,
      `Starting processing TransactionEvent: ${JSON.stringify(data)}`,
    );
    const input = this.mapper.fromEventToUpdateTrxInput(data);
    const result = await this.updateTrxGatewayResponseUseCase.run(
      input,
      UpdateSourceEnum.RABBIT,
    );
    await this.rabbitService.ackTransactionResponse(result);
  }
}
