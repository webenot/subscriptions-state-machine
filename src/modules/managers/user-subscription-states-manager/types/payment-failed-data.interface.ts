import type { Stripe } from 'stripe';

export interface IPaymentFailedData {
  data: {
    object: Stripe.Subscription;
  };
}
