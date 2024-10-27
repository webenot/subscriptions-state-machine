import type { StateMachineState } from '~/shared/state-machine/types';

import type { UserSubscriptionStatesEnum } from '../enums';
import type { TUserSubscriptionStateData } from './user-subscription-state-data.type';

export type UserSubscriptionState = StateMachineState<UserSubscriptionStatesEnum, TUserSubscriptionStateData>;
