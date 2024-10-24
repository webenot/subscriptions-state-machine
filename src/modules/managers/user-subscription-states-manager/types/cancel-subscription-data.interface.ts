import type { ICancelSubscriptionReason } from '~/modules/fundamentals/cancel-subscription-reasons/types';

export interface ICancelSubscriptionData {
  cancelReasons: ICancelSubscriptionReason[];
  textReason?: string | undefined;
}
