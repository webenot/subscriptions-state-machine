import type { SubscriptionStatusEnum } from '~/modules/fundamentals/subscriptions/enums/subscription-status.enum';

export interface IUpdateManualSubscriptionData {
  status: SubscriptionStatusEnum;
  subscriptionId?: string | undefined;
}
