import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { CurrencyEnum } from '../validations/currency';
import { TransactionStatusEnum } from '../validations/transaction/status';

const ALLOWED_CURRENCIES = Object.values(CurrencyEnum).join(', ');
const ALLOWED_STATUSES = Object.values(TransactionStatusEnum).join(', ');

export class TransactionWebhookDto {
  @IsNotEmpty({ message: 'Transaction ID must be provided.' })
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsEnum(TransactionStatusEnum, {
    message: `Invalid transaction status. Allowed statuses are: ${ALLOWED_STATUSES}`,
  })
  @IsNotEmpty({ message: 'TransactionStatus must be provided.' })
  status: TransactionStatusEnum;

  @IsNotEmpty({ message: 'Amount must be provided.' })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsEnum(CurrencyEnum, {
    message: `Invalid currency provided. Allowed currencies are: ${ALLOWED_CURRENCIES}`,
  })
  @IsNotEmpty({ message: 'Currency must be provided.' })
  currency: CurrencyEnum;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Client transaction date must be provided.' })
  @IsDate()
  originCreatedAt: Date;
}
