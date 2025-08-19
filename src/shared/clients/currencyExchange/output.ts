import { CurrencyEnum } from '../../validations/currency';

export interface CurrencyApiResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_updated: number;
  time_next_update: number;
  time_eol: number;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

export interface ExchangeRate {
  from: CurrencyEnum;
  to: CurrencyEnum;
  rate: number;
}
