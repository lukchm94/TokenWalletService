import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { WebhookPayload } from '../../../modules/transaction/app/input';
import { EnvVariables } from '../../../shared/config/envEnums';
import { AppLoggerService } from '../../../shared/logger/app-logger.service';
import { jsonStringifyReplacer } from '../../../shared/utils/json.utils';
import { GatewayOutput, GatewayResult } from '../api/output';

@Injectable()
export class GatewayService {
  private readonly gatewayUrl: string;
  private readonly webhook: string;
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.debug(this.logPrefix, 'GatewayService constructor');
    this.gatewayUrl = this.setGatewayUrl();
    this.webhook = this.setWebhook();
  }

  public async getStatus(payload: WebhookPayload): Promise<GatewayOutput> {
    const response: AxiosResponse<GatewayResult> = await firstValueFrom(
      this.httpService.post(this.gatewayUrl, payload, {
        headers: {
          webhook: this.webhook,
        },
      }),
    );
    this.logger.debug(
      this.logPrefix,
      `Received response - Status: ${response.status}, Data: ${JSON.stringify(response.data, jsonStringifyReplacer)}`,
    );
    return {
      status: response.status,
      statusText: response.statusText,
      data: {
        transactionId: response.data.result.data.transactionId,
        transactionStatus: response.data.result.data.transactionStatus,
      },
    };
  }

  private setGatewayUrl(): string {
    const gatewayUrl = this.configService.get<string>(EnvVariables.GATEWAY_URL);
    if (!gatewayUrl) {
      throw new Error(
        `${EnvVariables.GATEWAY_URL} not visible in .env file. Please update and restart the app`,
      );
    }
    return gatewayUrl;
  }

  private setWebhook(): string {
    const webhookUrl = this.configService.get<string>(
      EnvVariables.INTERNAL_WEBHOOk_URL,
    );
    if (!webhookUrl) {
      throw new Error(
        `${EnvVariables.INTERNAL_WEBHOOk_URL} not visible in .env file. Please update and restart the app`,
      );
    }
    this.logger.debug(this.logPrefix, `Using webhook URL: ${webhookUrl}`);
    return webhookUrl;
  }
}
