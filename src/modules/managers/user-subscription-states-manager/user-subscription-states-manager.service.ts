import { Injectable } from '@nestjs/common';
import type { Stripe } from 'stripe';

import { LoggerService } from '~/logger/logger.service';
import { SubscriptionPlatformEnum } from '~/modules/fundamentals/subscriptions/enums/subscription-platform.enum';
import { SubscriptionStatusEnum } from '~/modules/fundamentals/subscriptions/enums/subscription-status.enum';
import type { SubscriptionEntity } from '~/modules/fundamentals/subscriptions/subscription.entity';
import { SubscriptionsService } from '~/modules/fundamentals/subscriptions/subscriptions.service';
import { UsersService } from '~/modules/fundamentals/users/users.service';
import { ForbiddenStateMachineActionException } from '~/shared/state-machine/exceptions';
import { StateMachine } from '~/shared/state-machine/state-machine';

import { USER_SUBSCRIPTION_STATE_MACHINE_HANDLERS_KEY } from './constants';
import { UserSubscriptionsStateMachineEventHandler } from './decorators';
import { UserSubscriptionEventTypesEnum, UserSubscriptionStatesEnum } from './enums';
import type {
  BuySubscriptionReturnType,
  IBuySubscriptionEventData,
  ICancelSubscriptionData,
  ICreateManualSubscriptionData,
  IPaymentFailedData,
  IUpdateManualSubscriptionData,
  TUserSubscriptionStateData,
  UserSubscriptionData,
  UserSubscriptionEvent,
  UserSubscriptionState,
} from './types';
import { UserSubscriptionStateMachineEventsManagerService } from './user-subscription-state-machine-events-manager.service';

@Injectable()
export class UserSubscriptionStatesManagerService {
  private readonly logger: LoggerService;

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
    private readonly userSubscriptionStateMachineEventsManagerService: UserSubscriptionStateMachineEventsManagerService
  ) {
    this.logger = new LoggerService(UserSubscriptionStatesManagerService.name);
  }

  onModuleInit(): void {
    const handlers: object = (Reflect.getMetadata(USER_SUBSCRIPTION_STATE_MACHINE_HANDLERS_KEY, this.constructor) ||
      {}) as object;
    this.logger.info(`Service initialized with ${Object.keys(handlers).length} handlers`);
  }

  async runMachine<TReturn, TEvent>(
    userId: string,
    event: UserSubscriptionEvent<TEvent>
  ): Promise<TReturn | UserSubscriptionState> {
    const machine = await this.createMachine(userId, event);

    try {
      return await machine.transitionTo(event, this);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message, error.trace);
      if (error instanceof ForbiddenStateMachineActionException) {
        return machine.currentState;
      }
      throw error;
    }
  }

  async createMachine<TEvent>(
    userId: string,
    event: UserSubscriptionEvent<TEvent>
  ): Promise<StateMachine<UserSubscriptionStatesEnum, TUserSubscriptionStateData>> {
    const stripeSubscriptionId =
      event.data && event.data.data && typeof event.data.data === 'object' && 'object' in event.data.data
        ? (event.data.data as unknown as Stripe.CustomerSubscriptionUpdatedEvent).data.object.id
        : undefined;
    const subscriptionId =
      event.data && event.data.data && 'subscriptionId' in event.data
        ? (event.data.subscriptionId as string)
        : undefined;

    const currentState = await this.getUserCurrentState(userId, stripeSubscriptionId, subscriptionId);
    return new StateMachine(USER_SUBSCRIPTION_STATE_MACHINE_HANDLERS_KEY, currentState);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [
      UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL,
      UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL,
      UserSubscriptionStatesEnum.TRIAL,
    ],
    UserSubscriptionEventTypesEnum.BUY_SUBSCRIPTION
  )
  async buySubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<BuySubscriptionReturnType> {
    this.logger.info(this.buySubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.buyStripeSubscriptionEventHandler(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL, UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL],
    UserSubscriptionEventTypesEnum.CREATE_MANUAL
  )
  async createManualSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.createManualSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.createManualSubscriptionEventHandler(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [
      UserSubscriptionStatesEnum.ACTIVE,
      UserSubscriptionStatesEnum.ACTIVE_MOBILE,
      UserSubscriptionStatesEnum.PENDING,
      UserSubscriptionStatesEnum.TRIAL,
      UserSubscriptionStatesEnum.PAYMENT_FAILED,
      UserSubscriptionStatesEnum.CANCELLED_ACTIVE_MOBILE,
      UserSubscriptionStatesEnum.CANCELLED_ACTIVE,
      UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE,
    ],
    UserSubscriptionEventTypesEnum.UPGRADE_TO_MANUAL
  )
  async upgradeToManualSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.upgradeToManualSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.upgradeToManualSubscriptionEventHandler(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.ACTIVE_MANUAL],
    UserSubscriptionEventTypesEnum.UPGRADE_TO_MANUAL
  )
  async upgradeManualToManualSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<ICreateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.upgradeManualToManualSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.upgradeManualToManualSubscriptionEventHandler(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.ACTIVE_MANUAL],
    UserSubscriptionEventTypesEnum.EXPIRE_MANUAL
  )
  async expireManualSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<IUpdateManualSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.expireManualSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.expireManualSubscriptionEventHandler(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL],
    UserSubscriptionEventTypesEnum.USE_TRIAL
  )
  async useTrial(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<undefined>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.useTrial.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.useTrial(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [
      UserSubscriptionStatesEnum.PENDING,
      UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE,
      UserSubscriptionStatesEnum.PAYMENT_FAILED,
    ],
    UserSubscriptionEventTypesEnum.ACTIVATE_SUBSCRIPTION
  )
  async handleActivateSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<
      Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionPendingUpdateAppliedEvent
    >
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.handleActivateSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.handleActivateSubscription(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.PENDING, UserSubscriptionStatesEnum.PAYMENT_FAILED],
    UserSubscriptionEventTypesEnum.EXPIRE
  )
  async expireFromPending(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.expireFromPending.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.expireFromPending(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler([UserSubscriptionStatesEnum.ACTIVE], UserSubscriptionEventTypesEnum.CANCEL)
  async cancelSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<ICancelSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.cancelSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.cancelStripeSubscription(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE, UserSubscriptionStatesEnum.PAYMENT_FAILED],
    UserSubscriptionEventTypesEnum.CANCEL
  )
  async cancelSubscriptionInGrace(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<ICancelSubscriptionData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.cancelSubscriptionInGrace.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.cancelSubscriptionInGrace(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.PENDING, UserSubscriptionStatesEnum.PAYMENT_FAILED],
    UserSubscriptionEventTypesEnum.REVERT_UPGRADE
  )
  async revertSubscriptionUpgrade(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionPendingUpdateExpiredEvent>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.revertSubscriptionUpgrade.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.revertSubscriptionUpgrade(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [
      UserSubscriptionStatesEnum.CANCELLED_ACTIVE,
      UserSubscriptionStatesEnum.ACTIVE,
      UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE,
      UserSubscriptionStatesEnum.PAYMENT_FAILED,
    ],
    UserSubscriptionEventTypesEnum.CANCELED
  )
  async canceledSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionDeletedEvent>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.canceledSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.handleCancelledStripeSubscription(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.TRIAL],
    UserSubscriptionEventTypesEnum.TRIAL_EXPIRED
  )
  async expireTrial(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<undefined>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.expireTrial.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.expireTrial(currentState);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.ACTIVE, UserSubscriptionStatesEnum.CANCELLED_ACTIVE],
    UserSubscriptionEventTypesEnum.UPGRADE
  )
  async upgradeStripeSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.upgradeStripeSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.upgradeStripeSubscription(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.PENDING],
    UserSubscriptionEventTypesEnum.PAYMENT_FAILED_AFTER_UPGRADE
  )
  async paymentFailedAfterUpgradeStripeSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.paymentFailedAfterUpgradeStripeSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.paymentFailedAfterUpgradeStripeSubscription(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.ACTIVE_MOBILE, UserSubscriptionStatesEnum.CANCELLED_ACTIVE_MOBILE],
    UserSubscriptionEventTypesEnum.UPGRADE
  )
  async upgradeMobileSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<IBuySubscriptionEventData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.upgradeMobileSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.upgradeMobileSubscription(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.ACTIVE],
    UserSubscriptionEventTypesEnum.PAYMENT_FAILED
  )
  async subscriptionAutoPaymentFailed(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent | IPaymentFailedData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.subscriptionAutoPaymentFailed.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.subscriptionAutoPaymentFailed(
      currentState,
      data
    );
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.PENDING],
    UserSubscriptionEventTypesEnum.PAYMENT_FAILED
  )
  async subscriptionPaymentFailed(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<Stripe.CustomerSubscriptionUpdatedEvent | IPaymentFailedData>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.subscriptionPaymentFailed.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.subscriptionPaymentFailed(currentState, data);
  }

  @UserSubscriptionsStateMachineEventHandler(
    [UserSubscriptionStatesEnum.CANCELLED_ACTIVE],
    UserSubscriptionEventTypesEnum.ACTIVATE_SUBSCRIPTION
  )
  async renewCancelledSubscription(
    currentState: UserSubscriptionState,
    data: UserSubscriptionData<undefined>
  ): Promise<UserSubscriptionState> {
    this.logger.info(this.renewCancelledSubscription.name, { data, currentState });

    return await this.userSubscriptionStateMachineEventsManagerService.renewCancelledSubscription(currentState);
  }

  private async getUserCurrentState(
    userId: string,
    stripeSubscriptionId?: string,
    subscriptionId?: string
  ): Promise<UserSubscriptionState> {
    const user = await this.usersService.findOne({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    let subscription: SubscriptionEntity | null;

    if (stripeSubscriptionId) {
      subscription = await this.subscriptionsService.findOne({ stripeSubscriptionId, userId });
    } else if (subscriptionId) {
      subscription = await this.subscriptionsService.findOne({ userId, id: subscriptionId });
    } else {
      subscription = await this.subscriptionsService.getUserCurrentSubscription(userId);
    }

    let state = user.isTrialUsed
      ? UserSubscriptionStatesEnum.FREEMIUM_AFTER_TRIAL
      : UserSubscriptionStatesEnum.FREEMIUM_BEFORE_TRIAL;

    if (subscription) {
      if (
        subscription.onTrial &&
        subscription.provider === SubscriptionPlatformEnum.STRIPE &&
        subscription.status === SubscriptionStatusEnum.ACTIVE
      ) {
        state = UserSubscriptionStatesEnum.TRIAL;
      } else {
        switch (subscription.status) {
          case SubscriptionStatusEnum.ACTIVE:
            if (subscription.provider === SubscriptionPlatformEnum.STRIPE) {
              state = UserSubscriptionStatesEnum.ACTIVE;
            } else if (subscription.provider === SubscriptionPlatformEnum.MANUAL) {
              state = UserSubscriptionStatesEnum.ACTIVE_MANUAL;
            } else {
              state = UserSubscriptionStatesEnum.ACTIVE_MOBILE;
            }
            break;
          case SubscriptionStatusEnum.IN_GRACE:
            state = UserSubscriptionStatesEnum.PAYMENT_FAILED_IN_GRACE;
            break;
          case SubscriptionStatusEnum.PENDING:
            state = UserSubscriptionStatesEnum.PENDING;
            break;
          case SubscriptionStatusEnum.PAYMENT_FAILED:
            state = UserSubscriptionStatesEnum.PAYMENT_FAILED;
            break;
          case SubscriptionStatusEnum.CANCELED:
            if (user.isPremium) {
              state =
                subscription.provider === SubscriptionPlatformEnum.STRIPE
                  ? UserSubscriptionStatesEnum.CANCELLED_ACTIVE
                  : UserSubscriptionStatesEnum.CANCELLED_ACTIVE_MOBILE;
            }
            break;
        }
      }
    }

    this.logger.info(this.getUserCurrentState.name, { subscription, state, stripeSubscriptionId });

    return {
      state,
      data: {
        user,
        subscription,
      },
    };
  }
}
