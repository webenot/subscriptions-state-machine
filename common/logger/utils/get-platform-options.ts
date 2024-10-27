import type { LoggerOptions } from 'pino';

import { PlatformsEnum } from '../../utils/enums/platforms.enum';
import { awsLoggerOptions } from '../config/aws/aws-logger-options';
import { localLoggerOptions } from '../config/local/local-logger-options';
import { SERVICE_PLATFORM } from '../constants';

export const getPlatformOptions = (): LoggerOptions => {
  switch (SERVICE_PLATFORM) {
    case PlatformsEnum.AWS: {
      return awsLoggerOptions;
    }
    case PlatformsEnum.Local: {
      return localLoggerOptions;
    }
    default: {
      return localLoggerOptions;
    }
  }
};
