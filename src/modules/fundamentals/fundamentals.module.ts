import { Module } from '@nestjs/common';

import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';

const modules = [UsersModule, SubscriptionsModule];

@Module({
  imports: modules,
  exports: modules,
})
export class FundamentalsModule {}
