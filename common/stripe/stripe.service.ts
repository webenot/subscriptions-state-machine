import { Stripe } from 'stripe';

import { STRIPE_API_VERSION } from './constants';
import type { IStripeConfiguration } from './types';

/**
 * To verify stripe webhook payload in Lambda
 */
export class StripeService {
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly apiVersion = STRIPE_API_VERSION;
  private readonly stripe: Stripe;

  constructor(configuration: IStripeConfiguration) {
    this.secretKey = configuration.secretKey;
    this.webhookSecret = configuration.webhookSecret;
    this.stripe = new Stripe(this.secretKey, { apiVersion: this.apiVersion });
  }

  async verifyStripeWebhook(signature: string, payload: string | Buffer): Promise<never | Stripe.Event> {
    try {
      return await this.stripe.webhooks.constructEventAsync(payload, signature, this.webhookSecret);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error('StripeSignatureVerificationError', error);
      }

      throw error;
    }
  }
}
