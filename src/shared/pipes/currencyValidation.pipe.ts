import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CurrencyEnum } from '../validations/currency';

@Injectable()
export class CurrencyValidationPipe
  implements PipeTransform<string, CurrencyEnum>
{
  transform(value: string): CurrencyEnum {
    const allowedCurrencies = Object.values(CurrencyEnum).join(', ');
    if (
      !value ||
      !Object.values(CurrencyEnum).includes(value as CurrencyEnum)
    ) {
      throw new BadRequestException(
        `Invalid currency provided: ${value}. Allowed currencies: ${allowedCurrencies}`,
      );
    }
    return value as CurrencyEnum;
  }
}
