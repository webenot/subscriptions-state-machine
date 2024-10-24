import { Module } from '@nestjs/common';

import { ConfigurationModule } from '~/modules/configurations/configuration.module';
import { SubscriptionsModule } from '~/modules/fundamentals/subscriptions/subscriptions.module';
import { UsersModule } from '~/modules/fundamentals/users/users.module';
import { StripeCustomersManagerModule } from '~/modules/managers/stripe/stripe-customers-manager/stripe-customers-manager.module';
import { StripeModule } from '~/providers/stripe/stripe.module';

import { UserSubscriptionStateMachineEventsManagerService } from './user-subscription-state-machine-events-manager.service';
import { UserSubscriptionStatesManagerService } from './user-subscription-states-manager.service';

@Module({
  imports: [StripeCustomersManagerModule, SubscriptionsModule, UsersModule, StripeModule, ConfigurationModule],
  providers: [UserSubscriptionStatesManagerService, UserSubscriptionStateMachineEventsManagerService],
  exports: [UserSubscriptionStatesManagerService],
})
export class UserSubscriptionStatesManagerModule {}
