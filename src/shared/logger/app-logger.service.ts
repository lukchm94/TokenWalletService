import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { LoggerEnum } from './logger-enum';

@Injectable()
export class AppLoggerService extends Logger implements LoggerService {
  constructor() {
    super(LoggerEnum.NAME);
  }

  log(prefix: string, message: string, context?: string) {
    super.log(`${prefix} ${message}`, context || this.context);
  }

  error(prefix: string, message: string, trace?: string, context?: string) {
    super.error(`${prefix} ${message}`, trace, context || this.context);
  }

  warn(prefix: string, message: string, context?: string) {
    super.warn(`${prefix} ${message}`, context || this.context);
  }

  debug(prefix: string, message: string, context?: string) {
    super.debug(`${prefix} ${message}`, context || this.context);
  }

  verbose(prefix: string, message: string, context?: string) {
    super.verbose(`${prefix} ${message}`, context || this.context);
  }
}
