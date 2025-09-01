import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { CurrencyEnum } from '../validations/currency';

const ALLOWED_CURRENCIES = Object.values(CurrencyEnum).join(', ');

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Token ID must be provided.' })
  @IsString()
  tokenId: string;

  @IsEnum(CurrencyEnum, {
    message: `Invalid currency provided. Allowed currencies are: ${ALLOWED_CURRENCIES}`,
  })
  @IsNotEmpty({ message: 'Currency must be provided.' })
  @IsNotEmpty()
  currency: CurrencyEnum;

  @IsNotEmpty({ message: 'Amount must be provided.' })
  @IsNumber()
  amount: bigint;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Client transaction date must be provided.' })
  @IsDate()
  clientTransactionDate: Date;
}
