import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripePriceProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripePriceProviderService.name);
  }

  public async getById(id: string): Promise<Stripe.Price> {
    try {
      return await this.stripe.prices.retrieve(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async create(price: Stripe.PriceCreateParams): Promise<Stripe.Price> {
    try {
      return await this.stripe.prices.create(price);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
