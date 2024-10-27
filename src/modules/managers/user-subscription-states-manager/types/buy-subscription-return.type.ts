import type { UserSubscriptionStatesEnum } from '~/modules/managers/user-subscription-states-manager/enums';
import type { StateMachineState } from '~/shared/state-machine/types';

import type { CreateStripeSubscriptionResponse } from './create-stripe-subscription-response.type';
import type { TUserSubscriptionStateData } from './user-subscription-state-data.type';

export type TBuySubscriptionReturnData = TUserSubscriptionStateData & {
  newStripeSubscription: CreateStripeSubscriptionResponse;
};

export type BuySubscriptionReturnType = StateMachineState<UserSubscriptionStatesEnum, TBuySubscriptionReturnData>;
