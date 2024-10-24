import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';
import { PaymentNeedsConfirmationFromEmailException } from '~/modules/managers/stripe/stripe-invoices-manager/exceptions';

import { StripeRequestException } from './exceptions';
import { StripeProviderService } from './stripe.service';

@Injectable()
export class StripeInvoiceProviderService extends StripeProviderService {
  protected override readonly logger: LoggerService;

  constructor(protected override readonly configurationService: ConfigurationService) {
    super(configurationService);
    this.logger = new LoggerService(StripeInvoiceProviderService.name);
  }

  public async getById(id: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async payInvoice(id: string, parameters?: Stripe.InvoicePayParams): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.pay(id, parameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'invoice_payment_intent_requires_action') {
        throw new PaymentNeedsConfirmationFromEmailException(error.message);
      }
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async voidInvoice(id: string): Promise<
    Stripe.Invoice & {
      lastResponse: {
        headers: { [p: string]: string };
        requestId: string;
        statusCode: number;
        apiVersion?: string;
        idempotencyKey?: string;
        stripeAccount?: string;
      };
    }
  > {
    try {
      return await this.stripe.invoices.voidInvoice(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }

  public async getUpcomingInvoice(
    subscriptionId: string,
    subscriptionItemId: string,
    priceId: string
  ): Promise<Stripe.UpcomingInvoice> {
    const proration_date = Math.floor(Date.now() / 1000);
    const items = [
      {
        id: subscriptionItemId,
        price: priceId,
      },
    ];

    try {
      return await this.stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
        subscription_items: items,
        subscription_proration_date: proration_date,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new StripeRequestException(error.message, error.code, error.decline_code);
    }
  }
}
