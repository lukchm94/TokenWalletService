import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitClientNames, RabbitQueues } from './rabbit.enum';
import { TransactionRabbitService } from './services/transaction.rabbit.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RabbitClientNames.TRANSACTION_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ_URL || 'amqp://localhost:5672'],
          queue: RabbitQueues.REQ,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [TransactionRabbitService],
  exports: [TransactionRabbitService],
})
export class RabbitModule {}
