import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppLoggerService } from '../logger/app-logger.service';
import { RabbitMQMessages } from './rabbit.enum';

@Controller()
export class RabbitController {
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(private logger: AppLoggerService) {}
  @EventPattern(RabbitMQMessages.TRANSACTION_RESPONSE)
  handleTransactionResponse(@Payload() data: any) {
    const dataStr = JSON.stringify(data, null, 2);
    this.logger.log(
      this.logPrefix,
      'Received validation result from Service #2:',
      dataStr,
    );
  }
}
