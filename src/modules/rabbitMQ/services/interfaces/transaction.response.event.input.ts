import { RabbitQueues } from '../../rabbit.enum';
import { TransactionEvent } from './transaction.request.event.input';

export interface TransactionResponseEvent {
  pattern: RabbitQueues;
  data: TransactionEvent;
}
