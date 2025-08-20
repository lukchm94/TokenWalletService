import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CurrencyEnum } from '../validations/currency';

const ALLOWED_CURRENCIES = Object.values(CurrencyEnum).join(', ');

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Token ID must be provided.' })
  @IsString()
  tokenId: string;
  @IsEnum(CurrencyEnum, {
    message: `Invalid currency provided. Allowed currencies are: ${ALLOWED_CURRENCIES}`,
  })
  @IsNotEmpty()
  currency: CurrencyEnum;
  @IsNumber()
  amount: bigint;
}
