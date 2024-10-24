import { STRIPE_WEBHOOK_HANDLERS_KEY } from '~/providers/stripe/constants';
import { BaseEventHandlerDecorator } from '~/shared/decorators';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function StripeWebhookEventHandler(eventType: string): MethodDecorator {
  return BaseEventHandlerDecorator(STRIPE_WEBHOOK_HANDLERS_KEY, eventType);
}
