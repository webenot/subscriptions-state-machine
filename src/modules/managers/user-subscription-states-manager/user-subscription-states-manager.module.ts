import { Module } from '@nestjs/common';

import { StripeCustomersManagerModule } from '~/modules/managers/stripe/stripe-customers-manager/stripe-customers-manager.module';

import { UserSubscriptionStateMachineEventsManagerService } from './user-subscription-state-machine-events-manager.service';
import { UserSubscriptionStatesManagerService } from './user-subscription-states-manager.service';

@Module({
  imports: [StripeCustomersManagerModule],
  providers: [UserSubscriptionStatesManagerService, UserSubscriptionStateMachineEventsManagerService],
  exports: [UserSubscriptionStatesManagerService],
})
export class UserSubscriptionStatesManagerModule {}
