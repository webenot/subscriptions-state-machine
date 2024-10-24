export interface IBuySubscriptionEventData {
  product: IProduct;
  currency: string;
}

export interface IProduct {
  stripeId: string;
  sku: string;
  name: string;
}
