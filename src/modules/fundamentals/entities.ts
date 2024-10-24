// For typeORM v0.3 we need to use entity in datasource configuration
// Import entities here and export them in array
import { SubscriptionEntity } from './subscriptions/subscription.entity';
import { UserEntity } from './users/user.entity';

export const entities = [SubscriptionEntity, UserEntity];
