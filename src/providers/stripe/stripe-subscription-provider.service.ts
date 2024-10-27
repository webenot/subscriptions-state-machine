import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripeSubscriptionProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripeSubscriptionProviderService.name);
  }

  public async getById(id: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(id, {
        expand: ['latest_invoice.payment_intent.payment_method', 'pending_setup_intent'],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async create(subscription: Stripe.SubscriptionCreateParams): Promise<Stripe.Subscription> {
    this.logger.debug('Create Stripe subscription', subscription);

    try {
      return await this.stripe.subscriptions.create(subscription);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('Create Stripe subscription', error);
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async getSubscriptions(
    listParameters: Stripe.SubscriptionListParams
  ): Promise<Stripe.ApiListPromise<Stripe.Subscription>> {
    try {
      return await this.stripe.subscriptions.list(listParameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async updateById(id: string, updateParameters: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(id, updateParameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async manageCancellationById(id: string, isCancel = true): Promise<Stripe.Subscription> {
    try {
      return await this.updateById(id, { cancel_at_period_end: isCancel });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async retrieveUpcoming(parameters: Stripe.InvoiceRetrieveUpcomingParams): Promise<Stripe.UpcomingInvoice> {
    try {
      return await this.stripe.invoices.retrieveUpcoming(parameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async deleteDiscount(stripeSubscriptionId: string): Promise<Stripe.DeletedDiscount> {
    try {
      return await this.stripe.subscriptions.deleteDiscount(stripeSubscriptionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async cancelImmediately(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.cancel(stripeSubscriptionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
