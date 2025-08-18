import { Injectable } from '@nestjs/common';
import { Wallet } from 'src/modules/wallet/domain/wallet.entity';
import { AppLoggerService } from 'src/shared/logger/app-logger.service';
import { WalletDao } from '../wallet.dao';

@Injectable()
export class WalletMapper {
  private get logPrefix(): string {
    return `[${this.constructor.name}] - `;
  }
  constructor(private readonly logger: AppLoggerService) {}

  public fromDaoToObject(val: WalletDao): Wallet {
    this.logger.debug(
      this.logPrefix,
      `Converting ${JSON.stringify(val)} to Entity Object`,
    );
    return Wallet.create({
      id: val.id,
      tokenId: val.tokenId,
      balance: val.balance,
      currency: val.currency,
    });
  }
}
