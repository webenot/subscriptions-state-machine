import { Module } from '@nestjs/common';

import { StripeWebhookEventsManagerModule } from './stripe-webhook-events-manager/stripe-webhook-events-manager.module';
import { UserSubscriptionStatesManagerModule } from './user-subscription-states-manager/user-subscription-states-manager.module';

const modules = [UserSubscriptionStatesManagerModule, StripeWebhookEventsManagerModule];
@Module({
  imports: modules,
  exports: modules,
})
export class ManagersModule {}
