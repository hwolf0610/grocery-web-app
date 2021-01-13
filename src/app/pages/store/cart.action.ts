import {Action} from '@ngrx/store';
import {AddToCartModel, CartModel, DeleteCartProductModel, UpdateCartModel} from '../models/cart.model';

export const ADD_TO_CART = 'ADD_TO_CART';
export const UPDATE_CART_DATA = 'UPDATE_CART_DATA';
export const DELETE_CART_DATA = 'DELETE_CART_DATA';
export const GET_CART_DATA = 'GET_CART_DATA';
export const SET_CART_DATA = 'SET_CART_DATA';
export const APPLY_COUPON = 'APPLY_COUPON';
export const REMOVE_COUPON = 'REMOVE_COUPON';

// sends request to add item to the cart
export class AddToCartAction implements Action {
  readonly type = ADD_TO_CART;

  constructor(public payload: AddToCartModel) {
  }
}

// sends requets to update cart item
export class UpdateCartAction implements Action {
  readonly type = UPDATE_CART_DATA;

  constructor(public payload: UpdateCartModel) {
  }
}

// sends request to delete cart item
export class DeleteCartAction implements Action {
  readonly type = DELETE_CART_DATA;

  constructor(public payload: DeleteCartProductModel) {
  }
}

// sends request to get cart information
export class GetCartInfoAction implements Action {
  readonly type = GET_CART_DATA;

  constructor() {
  }
}

// sends request to set user's cart information
export class SetCartInfoAction implements Action {
  readonly type = SET_CART_DATA;

  constructor(public payload: CartModel) {
  }
}

// sends request to apply coupon on cart items
export class ApplyCouponAction implements Action {
  readonly type = APPLY_COUPON;

  constructor(public payload: { couponCode: string, id: string }) {
  }
}

// sends request to remove coupon applied on cart items
export class RemoveCouponAction implements Action {
  readonly type = REMOVE_COUPON;

  constructor(public payload: string) {
  }
}

export type CartActions =
  AddToCartAction
  | UpdateCartAction
  | DeleteCartAction
  | GetCartInfoAction
  | SetCartInfoAction
  | ApplyCouponAction
  | RemoveCouponAction;
