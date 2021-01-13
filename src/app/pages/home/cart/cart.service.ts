import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { ProductsModel, VariantModel } from "../../models/category.model";
import * as CartActions from "../../store/cart.action";
import { AddToCartModel, CartModel, DeleteCartProductModel, UpdateCartModel } from "../../models/cart.model";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { CartState } from "../../store/cart.reducer";
import { HelperService } from "../../../services/helper.service";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private crud: CrudService, private store: Store<CartState>, private helperService: HelperService) {
  }

  // update cart state
  public getUserCartState(): void {
    this.getUserCartDetails().subscribe((res: any) => {
      this.checkCartFormat(res, null);
    });
  }

  // prepares the cart data to send it to the server
  public prepareCartData(productInfo: ProductsModel, selectedVariant: VariantModel, quantity: number) {
    const cartInfo = {
      productId: productInfo._id,
      quantity: quantity,
      unit: selectedVariant.unit
    };
    this.addToCart(cartInfo).subscribe((res: any) => {
      this.checkCartFormat(res, 'save');
    });
  }

  // check if cart is added successfully
  public checkCartFormat(res, type?: string) {
    if (res.response_code === 201 || res.response_code === 200) {
      if (type) {
        let message = '';
        if (type !== 'coupon') {
          message = type == 'save' ? "CART_SAVE" : (type === 'update') ? "CART_UPDATE" : "CART_DELETE";
        } else {
          message = res.response_data.coupon ? "COUPON_APPLY" : "COUPON_DELETE";
        }
        this.helperService.successToast(message);
      }
      const cartData = typeof res.response_data === "object" ? res.response_data : this.getDefaultCartValues();
      this.store.dispatch(new CartActions.SetCartInfoAction(cartData));
    } else if (res.response_code === 403) {
      this.helperService.infoToast(res.response_data.message, true);
    }
  }

  // empties cart
  public clearCart(): void {
    let cartData = this.getDefaultCartValues();
    this.store.dispatch(new CartActions.SetCartInfoAction(cartData));
  }

  // gets default cart values
  public getDefaultCartValues(): CartModel {
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

  // prepares update cart data
  public prepareUpdateCartData(cartId: string, cartData: AddToCartModel, quantity: number): UpdateCartModel {
    return <UpdateCartModel>Object.assign({
      cartId: cartId,
      productId: cartData.productId,
      quantity: quantity
    });
  }

  // sends request to get user cart information
  public getUserCartDetails() {
    return this.crud.getData(`/carts/my`);
  }

  // sends request to add items to cart
  public addToCart(cartData): Observable<any> {
    return this.crud.saveData(`/carts/update`, cartData);
  }

  // sends request to update cart information
  public updateCart(cartData: UpdateCartModel): Observable<any> {
    return this.crud.saveData(`/carts/update`, cartData);
  }

  // sends request to delete product from cart
  public deleteProductFromCart(productId: string): Observable<any> {
    return this.crud.updateData(`/carts/remove/${productId}`, undefined);
  }

  // removes out of stock products
  public removeOutOfStockProducts(products): Observable<any> {
    return this.crud.saveData(`/cart/user/remove/multi/product`, products);
  }

  // sends request to apply coupon
  public applyCoupon(body): Observable<any> {
    const data = {
      couponCode: body.couponCode
    }
    return this.crud.saveData(`/carts/apply-coupon/${body.couponCode}`, data);
  }

  // sends request to remove applied coupon
  public removeCoupon(couponCode: string): Observable<any> {
    return this.crud.deleteData(`/carts/remove-coupon/${couponCode}`);
  }

  // get's delivery settings
  public getDeliverySettings(): Observable<any> {
    return this.crud.getData('/settings/details');
  }
}
