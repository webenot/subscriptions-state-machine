import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripePaymentMethodProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripePaymentMethodProviderService.name);
  }

  public async getById(id: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.retrieve(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async create(paymentMethod: Stripe.PaymentMethodCreateParams): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.create(paymentMethod);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async attach(
    paymentMethodId: string,
    paymentMethod: Stripe.PaymentMethodAttachParams
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, paymentMethod);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
