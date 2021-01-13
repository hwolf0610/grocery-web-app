import { AddToCartModel, CartModel } from './cart.model';

export interface AddressModel {
  _id?: string;
  address: string;
  flatNo: string;
  apartmentName: string;
  landmark: string;
  postalCode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  mobileNumber: string;
  addressType: string;
  user: string;
}

export interface DeliveryTaxModel {
  latitude: number;
  longitude: number;
  cartId: string;
}

export interface WorkingHoursModel {
  timings: Array<TimeScheduleModel>;
  _id: string;
  isClosed: boolean;
  date: string;
}

export interface TimeScheduleModel {
  _id: string;
  slot: string;
  isClosed: boolean
}

export interface PlaceOrderModel {
  paymentType: string;
  paymentId: string;
  deliverySlotId?: string;
  orderFrom?: string;
}

export interface CardModel {
  cardHolderName: string;
  cardNumber: string
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

export interface OrderListModel {
  _id: string;
  deliveryType: string;
  paymentType: string;
  isDeliveryBoyRated?: boolean;
  paymentStatus: string;
  address: AddressModel;
  deliveryDate: string;
  deliveryTime: string;
  cart: CartModel;
  deliveryCharges: number;
  subTotal: number;
  tax: number;
  appTimestamp: number;
  grandTotal: number;
  user: string;
  orderStatus: string;
  orderID: number;
  transactionDetails: Object;
  createdAt: Date;
  updatedAt: Date;
  amountRefund: number;
}

export interface OrderDetailsModel {
  orderInfo: OrderListModel;
  cart: AddToCartModel;
}

export interface RateModel {
  productId: string;
  description: string;
  rate: number;
}

export interface RateModelDeliveryBoy {
  rate: number,
  description: string,
  orderId: string,
  deliveryBoyId: string
}

export interface OrderModel {
  product: CartProductModel;
  _id: string;
  totalProduct: number;
  grandTotal: number;
  orderStatus: string;
  orderID: string;
  createdAt: string;
  usedWalletAmount: number;
}

export interface CartProductModel {
  title: string;
  imageUrl: string;
}

export enum WalletPaginationType {
  INC = 'inc',
  DEC = 'dec'
}
export interface Deliveryboy {
  assignedToName: string,
  assignedToId: string
}