import type { Stripe } from 'stripe';

export type CreateStripeSubscriptionResponse = Stripe.Subscription & {
  pending_setup_intent: Stripe.SetupIntent | null;
  latest_invoice: {
    payment_intent: Stripe.PaymentIntent;
  };
};
