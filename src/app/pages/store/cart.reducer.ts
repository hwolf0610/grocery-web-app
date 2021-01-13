import { CartModel } from '../models/cart.model';
import * as CartActions from './cart.action';

export interface CartState {
  cartInfo: CartModel;
}

function getDefaultCartValues(): CartModel {
  return {
    products: [],
    productIds: [],
    subTotal: 0,
    tax: 0,
    deliveryCharges: 0,
    grandTotal: 0,
    createdAt: null,
    updatedAt: null,
    user: null,
    _id: null,
    isOrderLinked: false
  };
}

export const initialState: CartState = {
  cartInfo: getDefaultCartValues()
};

export function cartReducer(state = initialState, action: CartActions.CartActions) {
  switch (action.type) {
    case CartActions.SET_CART_DATA:
      return {
        ...state.cartInfo,
        ...action.payload
      };
    default: {
      return state.cartInfo;
    }
  }
}
