import { Module } from '@nestjs/common';

import { UsersModule } from '~/modules/fundamentals/users/users.module';
import { StripeModule } from '~/providers/stripe/stripe.module';

import { StripeCustomersManagerService } from './stripe-customers-manager.service';

@Module({
  imports: [StripeModule, UsersModule],
  providers: [StripeCustomersManagerService],
  exports: [StripeCustomersManagerService],
})
export class StripeCustomersManagerModule {}
