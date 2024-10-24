import type { StateMachineEvent } from '~/shared/state-machine/types';

import type { UserSubscriptionEventTypesEnum } from '../enums';
import type { UserSubscriptionData } from './user-subscription-data.type';

export type UserSubscriptionEvent<TEventData> = StateMachineEvent<
  UserSubscriptionEventTypesEnum,
  UserSubscriptionData<TEventData>
>;
