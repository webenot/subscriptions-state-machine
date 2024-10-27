import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';
import { StripeRequestException } from '~/providers/stripe/exceptions';
import { StripeProviderService } from '~/providers/stripe/stripe.service';

@Injectable()
export class StripeCouponProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripeCouponProviderService.name);
  }

  public async create(parameters: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
    try {
      return await this.stripe.coupons.create(parameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
