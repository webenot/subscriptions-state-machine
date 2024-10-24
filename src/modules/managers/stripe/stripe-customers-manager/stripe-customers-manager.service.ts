import { Injectable } from '@nestjs/common';

import { LoggerService } from '~/logger/logger.service';
import type { UserEntity } from '~/modules/fundamentals/users/user.entity';
import { UsersService } from '~/modules/fundamentals/users/users.service';
import { StripeCustomerProviderService } from '~/providers/stripe/stripe-customer-provider.service';

@Injectable()
export class StripeCustomersManagerService {
  private readonly logger: LoggerService;

  constructor(
    private readonly stripeCustomerProviderService: StripeCustomerProviderService,
    private readonly usersService: UsersService
  ) {
    this.logger = new LoggerService(StripeCustomersManagerService.name);
  }

  async getOrCreateUserCustomer(user: UserEntity): Promise<string> {
    this.logger.debug(this.getOrCreateUserCustomer.name, user);

    if (user.stripeCustomerId) return user.stripeCustomerId;

    const stripeCustomer = await this.stripeCustomerProviderService.createCustomer({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
    this.logger.debug(this.getOrCreateUserCustomer.name, 'Stripe customer created', stripeCustomer);

    await this.usersService.update(user.id, { stripeCustomerId: stripeCustomer.id });

    return stripeCustomer.id;
  }
}
