import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { BehaviorSubject, Observable } from "rxjs";
import { AddressModel, PlaceOrderModel } from "../../models/order.model";
import { CartModel } from "../../models/cart.model";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private paymentMethodSubject = new BehaviorSubject<Array<string>>([]);     // contains payment method settings set by admin
  public paymentMethod$ = this.paymentMethodSubject.asObservable();       // subscribes to the latest payment method settings

  public walletAmountSubject = new BehaviorSubject<number>(0);      // contains user's wallet balance
  public wallet$ = this.walletAmountSubject.asObservable();     // subscribes to latest wallet balance

  private storeDeliverySubject = new BehaviorSubject<Array<number>>(null);     // contains stores location co-ordinates
  public store$ = this.storeDeliverySubject.asObservable();     // subscribes to store subject
  constructor(private crud: CrudService) {
  }

  // get's payment method settings
  public getPaymentMethodSettings(): void {
    this.crud.getData('/settings/details').subscribe((res: any) => {
      this.paymentMethodSubject.next(res.response_data.paymentMethod);
    });
  }

  // set's users wallet balance
  public setWalletBalance(walletAmount: number): void {
    this.walletAmountSubject.next(walletAmount);
  }

  // get's user's address
  public getAddress(): Observable<any> {
    return this.crud.getData('/address/list');
  }

  // get's address type list
  public getAddressTypeList(): Observable<any> {
    return this.crud.getData('/address/type/list');
  }

  // saves users address
  public saveAddress(address: AddressModel): Observable<any> {
    return this.crud.saveData('/address/create', address);
  }

  // updates users address
  public updateAddress(addressId: string, addressInfo: AddressModel): Observable<any> {
    return this.crud.updateData(`/address/update/${addressId}`, addressInfo);
  }

  // deletes address
  public deleteAddress(addressId: string): Observable<any> {
    return this.crud.deleteData(`/address/delete/${addressId}`);
  }

  // sends selected address to calculate delivery charges
  public calculateDeliveryCharges(addressData): Observable<any> {
    return this.crud.saveData('/carts/update-address', addressData);
  }

  // sends time and date timestamp to get store working hours
  public getWorkingHourSlots(time: string, timeStamp: number): Observable<any> {
    return this.crud.getData(`/settings/delivery-time-slots`);
  }

  // set's stores location info
  public setStoreLocationInfo(data: Array<number>): void {
    this.storeDeliverySubject.next(data);
  }

  // prepares order data
  public prepareOrderData(cartId: string, deliveryTime: string): PlaceOrderModel {
    return {
      deliverySlotId: deliveryTime,
      paymentType: '',
      orderFrom: 'WEB_APP',
      paymentId: ''
    };
  }

  // called when user selects pay by wallet option
  public applyWalletPayment(): Observable<any> {
    return this.crud.saveData('/carts/apply-wallet', undefined);
  }

  // removes wallet payment
  public removeWalletPayment(): Observable<any> {
    return this.crud.deleteData('/carts/remove-wallet');
  }
}
