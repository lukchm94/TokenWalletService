import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { CurrencyEnum } from '../validations/currency';

const ALLOWED_CURRENCIES = Object.values(CurrencyEnum).join(', ');

export class CreditCardDto {
  @IsNotEmpty()
  @IsString()
  @Length(16, 16, {
    message: 'Card number must be exactly 16 digits long',
  })
  cardNumber: string;
  @IsEnum(CurrencyEnum, {
    message: `Invalid currency provided. Allowed currencies are: ${ALLOWED_CURRENCIES}`,
  })
  @IsNotEmpty()
  currency: CurrencyEnum;
}
