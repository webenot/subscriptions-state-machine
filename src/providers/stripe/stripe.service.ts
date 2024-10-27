import Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { STRIPE_API_VERSION } from '../../../common/stripe';

export class StripeProviderService {
  protected readonly stripe: Stripe;
  protected readonly logger: LoggerService;

  constructor(protected readonly configurationService: ConfigurationService) {
    this.logger = new LoggerService(StripeProviderService.name);
    this.stripe = new Stripe(this.configurationService.get('STRIPE_SECRET_KEY'), { apiVersion: STRIPE_API_VERSION });
  }
}
