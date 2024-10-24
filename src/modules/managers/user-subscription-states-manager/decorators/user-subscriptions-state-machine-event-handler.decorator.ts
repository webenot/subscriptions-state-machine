import { StateMachineEventHandler } from '~/shared/state-machine/decorators';

import { USER_SUBSCRIPTION_STATE_MACHINE_HANDLERS_KEY } from '../constants';
import type { UserSubscriptionEventTypesEnum, UserSubscriptionStatesEnum } from '../enums';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UserSubscriptionsStateMachineEventHandler(
  states: UserSubscriptionStatesEnum[],
  eventType: UserSubscriptionEventTypesEnum
): MethodDecorator {
  return StateMachineEventHandler(USER_SUBSCRIPTION_STATE_MACHINE_HANDLERS_KEY, states, eventType);
}
