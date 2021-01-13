import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { AddToCartModel, CartModel } from '../../models/cart.model';
import { HelperService } from '../../../services/helper.service';
import { Router } from '@angular/router';
import { ProductsModel } from '../../models/category.model';
import * as _ from 'lodash';
import { environment } from "../../../../environments/environment";
import { ActiveToast } from "ngx-toastr";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CartService } from "./cart.service";
import { OrdersService } from "../orders/orders.service";
import { ProductsService } from "../products/products.service";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  public cartInfo: CartModel;     // contains user's cart information
  public relatedProducts: Array<ProductsModel> = [];    // contains list of related products
  public currencyCode: string = null;     // contains currency code
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-223`;      // contains optimized product image url
  public otherProductImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-105`;      // contains optimized product image url
  public minimumOrderAmount: number = 0;        // contains minimum order amount
  private modalRef: NgbModalRef;      // contains modal reference

  constructor(private store: Store<CartState>, private helperService: HelperService, private router: Router, private modalService: NgbModal, private cartService: CartService, private orderService: OrdersService, private productsService: ProductsService) {
    this.helperService.currency$.subscribe(currencyCode => {
      this.currencyCode = currencyCode;
    });
    this.store.select('cartInfo').subscribe(state => {
      if (state) {
        this.cartInfo = state;
      }
    });
  }

  ngOnInit(): void {
    if (this.cartInfo.products.length > 0) {
      this.getMinimumOrderAmount();
      this.getRelatedProducts();
    }
    this.helperService.scrollTop();
  }

  // contains minimum order amount
  private getMinimumOrderAmount(): void {
    this.cartService.getDeliverySettings().subscribe((res: any) => {
      this.minimumOrderAmount = res.response_data.minimumOrderAmountToPlaceOrder;
    });
  }

  // verifies cart before checkout
  public verifyCart(): void | ActiveToast<any> {
    if (this.cartInfo.subTotal < this.minimumOrderAmount) {
      return this.helperService.infoToast("MIN_ORDER", false, this.minimumOrderAmount);
    }
    this.goToCheckoutPage();
  }

  // navigates to checkout page
  public goToCheckoutPage(): void {
    this.router.navigate(['checkout']);
  }

  // get's related products
  private getRelatedProducts(): void {
    const products$ = this.productsService.getRelatedProducts();
    products$.subscribe((res: any) => {
      let productsId = [];
      this.cartInfo.products.forEach(p => {
        productsId.push({_id: p.productId});
      });
      let products: Array<any> = _.differenceBy(res.response_data, productsId, '_id');
      this.relatedProducts = products.slice(0, 2);
    });
  }

  // increments/decrements quantity
  public changeQuantity(type: string, cart: AddToCartModel): void {
    if (type === 'increment') {
      let quantity = cart.quantity;
      quantity += 1;
      // this.store.dispatch(new CartActions.UpdateCartAction({cartId: product.cartId, productId: product._id, quantity}));
      this.updateCartData(cart.productId, quantity, cart.unit);
    } else {
      if (cart.quantity > 1) {
        let quantity = cart.quantity;
        quantity -= 1;
        this.updateCartData(cart.productId, quantity, cart.unit);
      }
    }
  }

  // updates cart data
  private updateCartData(productId: string, quantity: number, unit: string): void {
    this.cartService.updateCart({
      cartId: this.cartInfo._id,
      productId: productId,
      quantity,
      unit
    }).subscribe((res: any) => {
      this.cartService.checkCartFormat(res, 'update')
    });
  }

  // sends request to delete product from cart
  public deleteProductFromCart(cart: AddToCartModel): void {
    this.cartService.deleteProductFromCart(cart.productId).subscribe((res: any) => {
      this.cartService.checkCartFormat(res, 'delete');
    });
  }

}
