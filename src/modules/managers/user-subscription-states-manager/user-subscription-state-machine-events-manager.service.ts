import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import type { Stripe } from 'stripe';

import { ConfigurationService } from '~/modules/configurations/configuration.service';
import { StripeCustomersManagerService } from '~/modules/managers/stripe/stripe-customers-manager/stripe-customers-manager.service';
import { getCurrencyAmountInCoins } from '~/modules/utils/math';
import { StripeCouponProviderService } from '~/providers/stripe/stripe-coupon-provider.service';
import { StripeSubscriptionProviderService } from '~/providers/stripe/stripe-subscription-provider.service';

import { UserSubscriptionStatesEnum } from './enums';
import type {
  BuySubscriptionReturnType,
  CreateStripeSubscriptionResponse,
  IBuySubscriptionEventData,
  ICancelSubscriptionData,
  ICreateManualSubscriptionData,
  IPaymentFailedData,
  IUpdateManualSubscriptionData,
  UserSubscriptionData,
  UserSubscriptionState,
} from './types';

@Injectable()
export class UserSubscriptionStateMachineEventsManagerService {
  constructor(
    private readonly stripeCustomersManagerService: StripeCustomersManagerService,
    private readonly stripeCouponProviderService: StripeCouponProviderService,
    private readonly stripeSubscriptionProviderService: StripeSubscriptionProviderService,
    private readonly configuration: ConfigurationService
  ) {}

  async createManualSubscriptionEventHandler(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    if (!currentState.data.subscription) return currentState;

    return {
      state: UserSubscriptionStatesEnum.ACTIVE_MANUAL,
      data: { ...currentState.data },
    };
  }

  async upgradeToManualSubscriptionEventHandler(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    if (currentState.data.user.isWebPremium) {
      throw new Error('User already has Premium subscription');
    }

    if (!currentState.data.subscription) return currentState;

    return {
      state: UserSubscriptionStatesEnum.ACTIVE_MANUAL,
      data: { ...currentState.data },
    };
  }

  async upgradeManualToManualSubscriptionEventHandler(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    if (currentState.data.user.isWebPremium) {
      throw new Error('User already has Premium subscription');
    }

    return {
      state: UserSubscriptionStatesEnum.ACTIVE_MANUAL,
      data: { ...currentState.data },
    };
  }

  async expireManualSubscriptionEventHandler(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<IUpdateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    return {
      state: currentState.data.user.isTrialUsed
        ? UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL
        : UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL,
      data: { ...currentState.data },
    };
  }

  async buyStripeSubscriptionEventHandler(
    currentState: UserSubscriptionState,
    { data }: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<BuySubscriptionReturnType> {
    const newStripeSubscription = await this.buyNewStripeSubscription(currentState, data);

    return {
      state: UserSubscriptionStatesEnum.PENDING,
      data: { ...currentState.data, newStripeSubscription },
    };
  }

  async handleActivateSubscription(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<
      Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionPendingUpdateAppliedEvent
    >
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.ACTIVE,
    };
  }

  async expireFromPending(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: currentState.data.user.isTrialUsed
        ? UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL
        : UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL,
    };
  }

  async handleCancelledStripeSubscription(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<Stripe.CustomerSubscriptionDeletedEvent>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: currentState.data.user.isTrialUsed
        ? UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL
        : UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL,
    };
  }

  async cancelStripeSubscription(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<ICancelSubscriptionData>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.CANCELLED_ACTIVE,
    };
  }

  async cancelSubscriptionInGrace(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<ICancelSubscriptionData>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.CANCELLED_ACTIVE,
    };
  }

  async useTrial(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<undefined>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.TRIAL,
    };
  }

  async expireTrial(currentState: UserSubscriptionState): Promise<UserSubscriptionState> {
    return {
      state: UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL,
      data: currentState.data,
    };
  }

  async upgradeStripeSubscription(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<UserSubscriptionState> {
    return {
      state: UserSubscriptionStatesEnum.PENDING,
      data: currentState.data,
    };
  }

  async revertSubscriptionUpgrade(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<Stripe.CustomerSubscriptionPendingUpdateExpiredEvent>
  ): Promise<UserSubscriptionState> {
    return currentState;
  }

  async paymentFailedAfterUpgradeStripeSubscription(
    currentState: UserSubscriptionState,
    _event: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent>
  ): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.PAYMENT_FAILED,
    };
  }

  async upgradeMobileSubscription(
    currentState: UserSubscriptionState,
    { data }: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<BuySubscriptionReturnType> {
    const newStripeSubscription = await this.buyNewStripeSubscription(currentState, data);

    return {
      state: UserSubscriptionStatesEnum.PENDING,
      data: { ...currentState.data, newStripeSubscription },
    };
  }

  async subscriptionAutoPaymentFailed(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent | IPaymentFailedData>
  ): Promise<UserSubscriptionState> {
    return {
      state: UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE,
      data: currentState.data,
    };
  }

  async subscriptionPaymentFailed(
    currentState: UserSubscriptionState,
    _data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent | IPaymentFailedData>
  ): Promise<UserSubscriptionState> {
    return {
      state: UserSubscriptionStatesEnum.PAYMENT_FAILED,
      data: currentState.data,
    };
  }

  async renewCancelledSubscription(currentState: UserSubscriptionState): Promise<UserSubscriptionState> {
    return {
      ...currentState,
      state: UserSubscriptionStatesEnum.ACTIVE,
    };
  }

  private async buyNewStripeSubscription(
    currentState: UserSubscriptionState,
    data: IBuySubscriptionEventData,
    discount = 0
  ): Promise<CreateStripeSubscriptionResponse> {
    const stripeCustomerId = await this.stripeCustomersManagerService.getOrCreateUserCustomer(currentState.data.user);

    let stripeCoupon: Stripe.Coupon | undefined;

    if (discount) {
      stripeCoupon = await this.stripeCouponProviderService.create({
        amount_off: getCurrencyAmountInCoins(discount, 2),
        currency: data.currency,
        duration: 'once',
      });
    }

    const newStripeSubscription = (await this.stripeSubscriptionProviderService.create({
      customer: stripeCustomerId,
      items: [{ price: this.configuration.get('STRIPE_PRICE_ID') }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: { product: JSON.stringify({ ..._.pick(data.product, ['id', 'sku', 'name']) }) },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      ...(stripeCoupon && { discounts: [{ coupon: stripeCoupon.id }] }),
    })) as CreateStripeSubscriptionResponse;

    return newStripeSubscription;
  }
}
