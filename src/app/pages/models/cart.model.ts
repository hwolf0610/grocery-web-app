import { OfferModel, ProductImageModel } from './category.model';

export interface AddToCartModel {
  productId: string;
  variantsName: string;
  productName: string;
  title: string;
  imageUrl: string;
  description: string;
  quantity: number;
  productTotal: number;
  unit: string;
  discountAmount?: number;
  originalPrice?: number;
  offerInfo?: OfferModel;
  amountAfterDiscount?: number;
  rating?: number;
  dealAmountOneProd?: number;
  delaPercent?: number;
  dealTotalAmount?: number;
  filePath?: string;
  isDealAvailable?: boolean;
  price?: number;
  productImages?: Array<ProductImageModel>;
}

export interface UpdateCartModel {
  cartId: string;
  productId: string;
  quantity: number;
  unit: string;
}

export interface DeleteCartProductModel {
  cartId: string;
  productId: string;
}

export interface CartModel {
  products: Array<AddToCartModel>;
  productIds: Array<string>;
  _id: string;
  subTotal: number;
  tax: number;
  grandTotal: number;
  deliveryCharges: number;
  isOrderLinked: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
  couponCode?: string;
  couponAmount?: CouponModel;
  deliveryAddress?: string;
  isFreeDelivery?: boolean;
  taxInfo?: TaxInfoModel;
  walletAmount?: number;
}

export interface CouponModel {
  couponCode: string;
  couponDiscountAmount: number;
}

export interface TaxInfoModel {
  taxName: string;
  amount: number;
}

export interface OutOfStockData {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  productTotal: number;
  imageUrl: string;
  filePath: string;
  dealAmount: number;
  dealPercent: number;
  dealTotalAmount: number
  isDealAvailable: boolean
}

export enum PaymentMethodEnum {
  COD = 'COD',
  STRIPE = 'STRIPE'
}
