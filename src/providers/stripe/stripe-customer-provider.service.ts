import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripeCustomerProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripeCustomerProviderService.name);
  }

  public async createCustomer(customer: Stripe.CustomerCreateParams): Promise<Stripe.Response<Stripe.Customer>> {
    try {
      return await this.stripe.customers.create(customer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async getCustomerById(id: string): Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>> {
    try {
      return await this.stripe.customers.retrieve(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async updateCustomerById(
    id: string,
    customerUpdateParameter: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Response<Stripe.Customer>> {
    try {
      return await this.stripe.customers.update(id, customerUpdateParameter);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
