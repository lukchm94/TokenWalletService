import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { jsonStringifyReplacer } from '../../../../shared/utils/json.utils';
import { EnvVariables } from '../../../config/envEnums';
import { AppLoggerService } from '../../../logger/app-logger.service';
import { CurrencyEnum, validCurrencies } from '../../../validations/currency';
import { CurrencyApiResponse, ExchangeRate } from '../output';

@Injectable()
export class CurrencyClientService {
  private readonly baseUrl: string;
  private readonly key: string;
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.key = this.setKey();
    this.baseUrl = `https://v6.exchangerate-api.com/v6/${this.key}/latest/`;
    this.logger.debug(this.logPrefix, `Setup baseUrl to ${this.baseUrl}`);
  }

  public async getExchangeRate(
    from: CurrencyEnum,
    to: CurrencyEnum,
  ): Promise<ExchangeRate> {
    const allRates = await this.getRates(from);
    this.logger.log(
      this.logPrefix,
      `Found allRates in public: ${JSON.stringify(allRates.conversion_rates, jsonStringifyReplacer)}`,
    );
    if (!allRates) {
      throw new BadRequestException(`Currency not found: ${from} -> ${to}`);
    }
    const rate: ExchangeRate = {
      from: from,
      to: to,
      rate: allRates.conversion_rates[to],
    };
    this.logger.debug(
      this.logPrefix,
      `Response: ${JSON.stringify(rate, jsonStringifyReplacer)} from: ${from} to: ${to} rate: ${allRates.conversion_rates[to]}`,
    );
    return rate;
  }

  private async getRates(
    baseCurrency: CurrencyEnum,
  ): Promise<CurrencyApiResponse> {
    if (!validCurrencies.includes(baseCurrency)) {
      this.logger.error(
        this.logPrefix,
        `Invalid base currency provided: ${baseCurrency}`,
      );
      throw new HttpException('Invalid base currency', HttpStatus.BAD_REQUEST);
    }
    try {
      this.logger.log(
        this.logPrefix,
        `Fetching exchange rates for base currency: ${baseCurrency}`,
      );
      const response: AxiosResponse<CurrencyApiResponse> = await firstValueFrom(
        this.httpService.get<CurrencyApiResponse>(
          `${this.baseUrl}${baseCurrency}`,
        ),
      );
      this.logger.debug(
        this.logPrefix,
        `Received the all exchange rates: ${JSON.stringify(response.data, jsonStringifyReplacer)}`,
      );
      return response.data;
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        this.logPrefix,
        `Failed to fetch exchange rates: ${msg}`,
      );
      throw new ServiceUnavailableException(
        `Failed to fetch external exchange rates. Error details: ${msg}`,
      );
    }
  }

  private setKey(): string {
    const key = this.configService.get<string>(EnvVariables.API_KEY);

    if (!key) {
      throw new Error(
        `${EnvVariables.API_KEY} not visible in .env file. Please update and restart the app`,
      );
    }
    return key;
  }
}
