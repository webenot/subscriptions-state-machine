import type { SupportedCurrenciesEnum } from '~/modules/fundamentals/currencies/enums';
import type { IProduct } from '~/modules/fundamentals/products/types/product.interface';

export interface IBuySubscriptionEventData {
  product: IProduct;
  currency: SupportedCurrenciesEnum;
}
