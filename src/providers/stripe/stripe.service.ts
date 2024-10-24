import Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import type { ConfigurationService } from '~/modules/configurations/configuration.service';

export class StripeProviderService {
  protected readonly stripe: Stripe;
  protected readonly logger: LoggerService;

  constructor(protected readonly configurationService: ConfigurationService) {
    this.logger = new LoggerService(StripeProviderService.name);
    this.stripe = new Stripe(
      this.configurationService.getStripeSecretKey(),
      this.configurationService.getStripeConfig()
    );
  }
}
