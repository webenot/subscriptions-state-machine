import { Module } from '@nestjs/common';

import { StripeWebhookEventsManagerService } from './stripe-webhook-events-manager.service';
import { StripeWebhookEventsSqsConsumer } from './stripe-webhook-events-sqs.consumer';

@Module({
  imports: [],
  providers: [StripeWebhookEventsManagerService, StripeWebhookEventsSqsConsumer],
  exports: [StripeWebhookEventsManagerService],
})
export class StripeWebhookEventsManagerModule {}
