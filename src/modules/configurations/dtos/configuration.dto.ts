import { IsBooleanString, IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

import { LogLevelEnum } from '~/logger/enums';
import { PlatformsEnum } from '../../utils/enums';

export class ConfigurationDto {
  @IsNotEmpty()
  @IsNumberString()
  SERVICE_PORT: string;

  @IsNotEmpty()
  @IsString()
  FE_BASE_APP_URL: string;

  @IsNotEmpty()
  @IsString()
  NODE_ENV: string;

  @IsNotEmpty()
  @IsEnum(PlatformsEnum)
  SERVICE_PLATFORM = PlatformsEnum;

  @IsNotEmpty()
  @IsEnum(LogLevelEnum)
  LOG_LEVEL = LogLevelEnum;

  /**
   * Database's section
   */
  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  DB_NAME: string;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @IsString()
  DB_PORT: string;

  @IsNotEmpty()
  @IsBooleanString()
  DB_LOGGING: string;

  /**
   * Redis's section
   */
  @IsNotEmpty()
  @IsString()
  REDIS_HOST: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PORT: string;

  @IsNotEmpty()
  @IsString()
  REDIS_USER: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PASSWORD: string;

  /**
   * AWS
   */
  @IsNotEmpty()
  @IsString()
  AWS_REGION: string;

  /**
   * AWS SQS
   */
  @IsNotEmpty()
  @IsString()
  AWS_STRIPE_WEBHOOK_EVENTS_QUEUE_NAME: string;

  @IsNotEmpty()
  @IsString()
  AWS_STRIPE_WEBHOOK_EVENTS_QUEUE_URL: string;

  /**
   * Stripe
   */
  @IsNotEmpty()
  @IsString()
  STRIPE_PRICE_ID: string;
}
