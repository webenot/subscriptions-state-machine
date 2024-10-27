import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { SubscriptionsService } from '~/modules/fundamentals/subscriptions/subscriptions.service';
import { UserSubscriptionEventTypesEnum } from '~/modules/managers/user-subscription-states-manager/enums';
import type { UserSubscriptionState } from '~/modules/managers/user-subscription-states-manager/types';
import { UserSubscriptionStatesManagerService } from '~/modules/managers/user-subscription-states-manager/user-subscription-states-manager.service';
import { BaseSqsEventsHandlerService } from '~/providers/aws/sqs/base-sqs-events-handler.service';
import { STRIPE_WEBHOOK_HANDLERS_KEY } from '~/providers/stripe/constants';

import { StripeWebhookEventHandler } from './decorators';
import { StripeWebhookEventTypesEnum } from './enums';

@Injectable()
export class StripeWebhookEventsManagerService extends BaseSqsEventsHandlerService {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userSubscriptionStatesManagerService: UserSubscriptionStatesManagerService
  ) {
    super(STRIPE_WEBHOOK_HANDLERS_KEY, new LoggerService(StripeWebhookEventsManagerService.name));
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.SUBSCRIPTION_UPDATED)
  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.SUBSCRIPTION_DELETED)
  async handleSubscriptionUpdatedEvent(event: Stripe.CustomerSubscriptionUpdatedEvent): Promise<void> {
    this.logger.info(`Subscription updated or deleted events handling started [${event.id}]`);

    const subscription = await this.subscriptionsService.findOne({ stripeSubscriptionId: event.data.object.id });
    if (!subscription) {
      this.logger.info(`Subscription [${event.data.object.id}] not found`);
      return;
    }

    await this.userSubscriptionStatesManagerService.runMachine<
      UserSubscriptionState,
      Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionDeletedEvent
    >(subscription.userId, {
      type: UserSubscriptionEventTypesEnum.ACTIVATE_SUBSCRIPTION,
      data: { userId: subscription.userId, data: event },
    });
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.INVOICE_CREATED)
  async handleInvoiceCreatedEvent(event: Stripe.InvoiceCreatedEvent): Promise<void> {
    this.logger.info(`Invoice created event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.INVOICE_UPDATED)
  async handleInvoiceUpdatedEvent(event: Stripe.InvoiceUpdatedEvent): Promise<void> {
    this.logger.info(`Invoice updated event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.INVOICE_PAYMENT_FAILED)
  async handleInvoicePaymentFailedEvent(event: Stripe.InvoicePaymentFailedEvent): Promise<void> {
    this.logger.info(`Invoice payment failed event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_INTENT_CREATED)
  async handlePaymentIntentCreatedEvent(event: Stripe.PaymentIntentCreatedEvent): Promise<void> {
    this.logger.info(`Payment intent created event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_INTENT_CANCELED)
  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_INTENT_SUCCEEDED)
  async handlePaymentIntentUpdateEvent(
    event: Stripe.PaymentIntentCanceledEvent | Stripe.PaymentIntentSucceededEvent
  ): Promise<void> {
    this.logger.info(`Payment intent canceled and succeeded events handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_INTENT_REQUIRES_ACTION)
  async handlePaymentIntentRequiresActionEvent(event: Stripe.PaymentIntentRequiresActionEvent): Promise<void> {
    this.logger.info(`Payment requires events handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_INTENT_PAYMENT_FAILED)
  async handlePaymentIntentPaymentFailedEvent(event: Stripe.PaymentIntentPaymentFailedEvent): Promise<void> {
    this.logger.info(`Payment intent payment failed event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.SUBSCRIPTION_PENDING_UPDATE_EXPIRED)
  async handleSubscriptionPendingUpdatedExpiredEvent(
    event: Stripe.CustomerSubscriptionPendingUpdateExpiredEvent
  ): Promise<void> {
    this.logger.info(`Subscription pending update expired or deleted events handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.SUBSCRIPTION_PENDING_UPDATE_APPLIED)
  async handleSubscriptionPendingUpdatedAppliedEvent(
    event: Stripe.CustomerSubscriptionPendingUpdateAppliedEvent
  ): Promise<void> {
    this.logger.info(`Subscription pending update applied or deleted events handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.CHARGE_SUCCEEDED)
  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.CHARGE_FAILED)
  async handleChargeSucceededEvent(event: Stripe.ChargeSucceededEvent | Stripe.ChargeFailedEvent): Promise<void> {
    this.logger.info(`Charge succeeded or failed event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.PAYMENT_METHOD_ATTACHED)
  async handlePaymentMethodAttachedEvent(event: Stripe.PaymentMethodAttachedEvent): Promise<void> {
    this.logger.info(`Payment method attached event handling started [${event.id}]`);
  }

  @StripeWebhookEventHandler(StripeWebhookEventTypesEnum.CUSTOMER_DELETED)
  async handleCustomerDeletedEvent(event: Stripe.CustomerDeletedEvent): Promise<void> {
    this.logger.info(`Customer deleted event handling started [${event.id}]`);
  }
}
