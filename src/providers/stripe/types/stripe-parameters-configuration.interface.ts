import type { STRIPE_API_VERSION } from '../../../../common/stripe';

export interface IStripeParametersConfiguration {
  apiVersion: typeof STRIPE_API_VERSION;
}
