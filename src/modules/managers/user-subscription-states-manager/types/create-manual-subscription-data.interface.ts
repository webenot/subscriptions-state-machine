import { IProduct } from '~/modules/managers/user-subscription-states-manager/types/buy-subscription-event-data.interface';

export interface ICreateManualSubscriptionData {
  product: IProduct;
}
