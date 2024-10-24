import type Stripe from 'stripe';

export interface IStripeEventTypeHandler {
  eventType: Stripe.Event.Type;
  methodName: (event: Stripe.Event) => void;
}
