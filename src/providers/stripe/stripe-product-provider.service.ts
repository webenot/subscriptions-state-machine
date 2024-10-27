import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripeProductProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripeProductProviderService.name);
  }

  public async getById(id: string): Promise<Stripe.Product> {
    try {
      return await this.stripe.products.retrieve(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async create(product: Stripe.ProductCreateParams): Promise<Stripe.Product> {
    try {
      return await this.stripe.products.create(product);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
