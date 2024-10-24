import { Module } from '@nestjs/common';

import { ConfigurationModule } from '~/modules/configurations/configuration.module';

import { StripeChargeProviderService } from './stripe-charge-provider.service';
import { StripeCouponProviderService } from './stripe-coupon-provider.service';
import { StripeCustomerProviderService } from './stripe-customer-provider.service';
import { StripeInvoiceProviderService } from './stripe-invoice-provider.service';
import { StripePaymentIntentProviderService } from './stripe-payment-intent-provider.service';
import { StripePaymentMethodProviderService } from './stripe-payment-method-provider.service';
import { StripePriceProviderService } from './stripe-price-provider.service';
import { StripeProductProviderService } from './stripe-product-provider.service';
import { StripeSubscriptionProviderService } from './stripe-subscription-provider.service';

@Module({
  imports: [ConfigurationModule],
  providers: [
    StripeCustomerProviderService,
    StripePaymentIntentProviderService,
    StripeChargeProviderService,
    StripeInvoiceProviderService,
    StripeProductProviderService,
    StripePriceProviderService,
    StripeSubscriptionProviderService,
    StripePaymentMethodProviderService,
    StripeCouponProviderService,
  ],
  exports: [
    StripeCustomerProviderService,
    StripePaymentIntentProviderService,
    StripeChargeProviderService,
    StripeInvoiceProviderService,
    StripeProductProviderService,
    StripePriceProviderService,
    StripeSubscriptionProviderService,
    StripePaymentMethodProviderService,
    StripeCouponProviderService,
  ],
})
export class StripeModule {}
