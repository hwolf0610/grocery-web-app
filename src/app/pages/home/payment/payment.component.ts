import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CardModel, PlaceOrderModel } from '../../models/order.model';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { CartModel, OutOfStockData, PaymentMethodEnum } from '../../models/cart.model';
import { HelperService } from '../../../services/helper.service';
import { Router } from '@angular/router';
import { ActiveToast } from 'ngx-toastr';
import { environment } from "../../../../environments/environment";
import { CheckoutService } from "../checkout/checkout.service";
import { CartService } from "../cart/cart.service";
import { OrdersService } from "../orders/orders.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  closeResult = '';
  public cartInfo: CartModel; // contains user's cart information
  public orderData: PlaceOrderModel; // contains order information
  public cardData: CardModel; // contains card information to make payment
  public currencyCode: string = null; // contains currency code
  public outOfStockData: Array<OutOfStockData> = [];        // contains list of out of stock data
  private modalRef: NgbModalRef;        // contains reference to out of stock modal
  @ViewChild('outOfStockModal', { static: false }) public outOfStockModal: TemplateRef<any>;        // contains reference to ot of stock mda
  public businessInfo;      // contains business info modal
  public minimumOrderAmount: number = 0;        // contains minimum order amount
  public isStripe = false;      // enables stripe option when true
  public paymentMethods: Array<string> = [];      // shows payment method set by admin
  public walletBalance: number = 0;     // contains user's wallet balance
  public grandTotal: number = 0;        // contains cart grand total
  public isWalletUsed: boolean = false;     // set to true when user uses his wallet to make payment
  public isCODAvailable: boolean = false;   // show's COD if COD payment is available
  public isStripeAvailable: boolean = false;   // show's STRIPE payment if STRIPE payment is available

  constructor(private modalService: NgbModal, private store: Store<CartState>, private helperService: HelperService, private router: Router, private checkoutService: CheckoutService, private cartService: CartService, private orderService: OrdersService) {
    this.checkoutService.wallet$.subscribe(walletBalance => {
      this.walletBalance = walletBalance;
    });
    this.checkoutService.paymentMethod$.subscribe(paymentMethod => {
      this.paymentMethods = paymentMethod;
      if (this.paymentMethods.length > 0) {
        this.isCODAvailable = this.paymentMethods.includes(PaymentMethodEnum.COD);
        this.isStripeAvailable = this.paymentMethods.includes(PaymentMethodEnum.STRIPE);
      }

    });
    this.helperService.currency$.subscribe((currencyCode) => {
      this.currencyCode = currencyCode;
    });
    this.getMinimumOrderAmount();
    this.getBusinessInfo();
    this.cardData = this.getDefaultCardValues();

    if (environment.STRIPE_PUBLISHABLE_KEY) this.isStripe = true;

    this.store.select('cartInfo').subscribe((state) => {
      if (state) {
        this.cartInfo = state;
        this.grandTotal = this.cartInfo.grandTotal;
        this.isWalletUsed = this.cartInfo.walletAmount && this.cartInfo.walletAmount > 0 ? true : false;
        if (localStorage.getItem('orderData')) {
          this.orderData = JSON.parse(atob(atob(atob(localStorage.getItem('orderData')))));
          
        } else {
          this.router.navigate(['home']);
        }
      } else {
        this.router.navigate(['home']);
      }
    });
  }

  // contains minimum order amount
  private getMinimumOrderAmount(): void {
    this.cartService.getDeliverySettings().subscribe((res: any) => {
      this.minimumOrderAmount = res.response_data.minimumOrderAmountToPlaceOrder;
    });
  }

  // get's business info
  public getBusinessInfo(): void {
    this.helperService.businessInfo$.subscribe(businessInfo => {
      if (businessInfo) {
        this.businessInfo = businessInfo;
      }
    })
  }

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  // opens out of stock modal
  public openOutOfStockModal(): void {
    this.modalRef = this.modalService.open(this.outOfStockModal, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      backdrop: false,
      keyboard: false
    });
  }

  // get default card values
  public getDefaultCardValues(): CardModel {
    return {
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: null,
      expiryYear: null,
      cvv: null,
    };
  }

  // sets wallet amount and updates grand total
  public setWalletAmount(): void {
    if (this.isWalletUsed) {
      this.checkoutService.applyWalletPayment().subscribe((res: any) => {
        this.orderData.paymentType = 'COD';
        this.updateOrderData();
        this.cartService.checkCartFormat(res);
      });
    } else {
      this.checkoutService.removeWalletPayment().subscribe((res: any) => {
        this.orderData.paymentType = '';
        this.updateOrderData();
        this.cartService.checkCartFormat(res);
      });
    }
  }

  // update order data
  private updateOrderData(): void {
    const encodedData = btoa(btoa(btoa(JSON.stringify(this.orderData))));
    localStorage.setItem('orderData', encodedData);
  }

  // sets payment type
  public setPaymentType(type: string): void {
    this.orderData.paymentType = type;
    this.cardData = this.getDefaultCardValues();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // sends's request to place order
  public placeOrder(): void | ActiveToast<any> {
    if (this.cartInfo.subTotal < this.minimumOrderAmount) {
      return this.helperService.infoToast("MIN_ORDER", false, this.minimumOrderAmount);
    }
    this.orderService.placeOrder(this.orderData).subscribe((res: any) => {
      if (res.response_code !== 200) {
        this.outOfStockData = res.response_data;
        this.openOutOfStockModal();
      } else {
        this.helperService.successToast(res.response_data, true);
        this.cartService.clearCart();
        localStorage.removeItem('orderData');
        localStorage.removeItem('address');
        this.router.navigate(['thank-you']);
      }
    });
  }

  // closes out of stock modal
  public closeModal(): void {
    this.modalRef.close();
    this.outOfStockData = [];
    this.router.navigate(['cart']);
  }

  // opens stripe checkout
  public openStripeCheckout() {
    if (this.cartInfo.subTotal < this.minimumOrderAmount) {
      return this.helperService.infoToast("MIN_ORDER", false, this.minimumOrderAmount);
    }
    let that = this;
    const key = environment.STRIPE_PUBLISHABLE_KEY;
    var handler = (<any>window).StripeCheckout.configure({
      key: key,
      locale: 'auto',
      currency: this.currencyCode,
      image: 'assets/images/thumbnail.png',
      token: function (paymentResponse: any) {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        that.orderData.paymentId = paymentResponse.id;
        that.placeOrder();
      }
    });
    handler.open({
      name: this.businessInfo.storeName,
      description: `Order payment - ${this.currencyCode}${this.grandTotal}`,
      amount: this.grandTotal * 100,
      // shippingAddress: true,
      billingAddress: false
    });
  }
}
