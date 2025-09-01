import { BadRequestException, Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';
import { TransactionStatusEnum } from '../../../../shared/validations/transaction/status';
import { TransactionRepresentation } from '../../api/representation';
import { TransactionRepresentationMapper } from '../../api/representationMapper';
import { TransactionService } from '../../domain/services/transaction.service';

@Injectable()
export class CancelTransactionUseCase {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly transactionService: TransactionService,
    private readonly mapper: TransactionRepresentationMapper,
  ) {}

  public async run(transactionId: number): Promise<TransactionRepresentation> {
    const transaction = await this.transactionService.getById(transactionId);
    if (transaction.status === TransactionStatusEnum.CANCELLED) {
      const msg = `Transaction: ${transactionId} already with status: ${transaction.status}. Cannot update.`;
      this.logger.warn(this.logPrefix, msg);
      throw new BadRequestException(msg);
    }
    const cancelledTransaction = await this.transactionService.update({
      transactionId,
      status: TransactionStatusEnum.CANCELLED,
    });
    this.logger.log(
      this.logPrefix,
      `Transaction: ${cancelledTransaction.id} updated to status: ${cancelledTransaction.status} successfully.`,
    );
    const result = this.mapper.getTransaction(cancelledTransaction);
    return result;
  }
}
