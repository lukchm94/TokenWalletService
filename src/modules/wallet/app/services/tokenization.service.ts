import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EnvVariables } from '../../../../shared/config/envEnums';
import { AppLoggerService } from '../../../../shared/logger/app-logger.service';

@Injectable()
export class TokenizationService {
  private readonly secretKey: string;
  private readonly algorithm: string;
  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }

  constructor(
    private readonly logger: AppLoggerService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.setSecretKey();
    this.algorithm = this.setAlgorithm();
  }

  public generateToken(val: number): string {
    this.logger.debug(this.logPrefix, `Generating token for card: ${val}`);
    return crypto
      .createHmac(this.algorithm, this.secretKey)
      .update(val.toString())
      .digest('hex');
  }

  private setSecretKey(): string {
    const key = this.configService.get<string>(EnvVariables.TOKEN_KEY);
    if (!key) {
      throw new Error(
        `${EnvVariables.TOKEN_KEY} not visible in .env file. Please update and restart the app`,
      );
    }
    return key;
  }
  private setAlgorithm(): string {
    const algorithm = this.configService.get<string>(
      EnvVariables.TOKEN_ALGORITHM,
    );
    if (!algorithm) {
      throw new Error(
        `${EnvVariables.TOKEN_ALGORITHM} not visible in .env file. Please update and restart the app`,
      );
    }
    return algorithm;
  }
}
