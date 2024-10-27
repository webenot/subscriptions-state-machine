import type { SubscriptionEntity } from '~/modules/fundamentals/subscriptions/subscription.entity';
import type { UserEntity } from '~/modules/fundamentals/users/user.entity';

export type TUserSubscriptionStateData = {
  user: UserEntity;
  subscription: SubscriptionEntity | null;
};
