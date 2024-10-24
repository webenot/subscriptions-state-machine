import { Module } from '@nestjs/common';

import { SubscriptionsModule } from '~/modules/fundamentals/subscriptions/subscriptions.module';
import { UserSubscriptionStatesManagerModule } from '~/modules/managers/user-subscription-states-manager/user-subscription-states-manager.module';

import { StripeWebhookEventsManagerService } from './stripe-webhook-events-manager.service';
import { StripeWebhookEventsSqsConsumer } from './stripe-webhook-events-sqs.consumer';

@Module({
  imports: [SubscriptionsModule, UserSubscriptionStatesManagerModule],
  providers: [StripeWebhookEventsManagerService, StripeWebhookEventsSqsConsumer],
  exports: [StripeWebhookEventsManagerService],
})
export class StripeWebhookEventsManagerModule {}
