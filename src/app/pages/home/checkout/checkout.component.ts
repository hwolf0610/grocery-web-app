import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbDateStruct, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { CartModel } from '../../models/cart.model';
import { AddressModel, DeliveryTaxModel, TimeScheduleModel, WorkingHoursModel } from '../../models/order.model';
import { HelperService } from '../../../services/helper.service';
import * as CartActions from '../../store/cart.action';
import { Router } from '@angular/router';
import { ActiveToast } from "ngx-toastr";
import * as moment from 'moment';
import { CartService } from "../cart/cart.service";
import { CheckoutService } from "./checkout.service";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  model: NgbDateStruct;
  date: {year: number; month: number};
  public cartInfo: CartModel;     // contains cart state
  private modalRef: NgbModalRef;      // contains reference to address modal
  public addressList: Array<AddressModel> = [];     // contains list of user address
  public addressData: AddressModel;     // contains address information
  public addressId: string;        // contains id of selected address to update
  public selectedAddress: string = null;      // contains id of the selected
  public deliveryDate: string;     // contains the selected delivery date
  public deliveryTime: string = '';     // contain's delivery time slot
  public isValidDeliverySlot: boolean = false;      // set to true when user selects a valid delivery date and time slot
  public minDate: NgbDateStruct;      // contains min date
  public timeSchedulesSlots: Array<TimeScheduleModel> = [];     // shows available slots on selected date
  public couponCode: string = '';        // contains coupon code
  public currencyCode: string = null;     // contains currency code
  public showMap: boolean = false;     //    set to true when address is fetched from the geocoding api
  public hideEdit: boolean = false;     //    set to true when address is fetched from the geocoding api
  public workingHours: Array<WorkingHoursModel> = [];     // contains working hours of next seven days
  public adminLocation: Array<number> = [];     // contains store location information
  public mapAddress: string = null;      // contains map address
  public location = {
    lat: null,
    lng: null
  };      // contains current and updated location information
  public addressTypes: Array<string> = [];      // contains list of address types

  constructor(private calendar: NgbCalendar, private store: Store<CartState>, private modalService: NgbModal, private helperService: HelperService, private router: Router, private cartService: CartService, private checkoutService: CheckoutService) {

    this.checkoutService.store$.subscribe(data => {
      if (data) {
        this.adminLocation = data;
      }
    });
    this.helperService.currency$.subscribe(currencyCode => {
      this.currencyCode = currencyCode;
    });
    const date = new Date();
    this.minDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    this.store.select('cartInfo').subscribe(state => {
      if (state) {
        this.cartInfo = state;
        if (this.cartInfo.products.length > 0) {
          this.getUserAddressList();
        }
      }
    });
    this.getStoreWorkingHours();
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // get's default address values
  private getDefaultAddressValues(address?: AddressModel): AddressModel {
    return {
      address: address ? address.address : '',
      flatNo: address ? address.flatNo : '',
      mobileNumber: address ? address.mobileNumber : '',
      user: address ? address.user : '',
      postalCode: address ? address.postalCode : '',
      addressType: address ? address.addressType : '',
      apartmentName: address ? address.apartmentName : '',
      landmark: address ? address.landmark : '',
      location: address ? address.location : {latitude: null, longitude: null}
    };
  }

  // sets map show status
  public setMapShowStatus(): void {
    this.showMap = !this.showMap;
    this.mapAddress = this.addressData.address;
    this.location = {lat: this.addressData.location.latitude, lng: this.addressData.location.longitude};
    this.hideEdit = this.showMap === false;
  }

  // set's map address
  public setMapAddress(): void {
    this.addressData.address = this.mapAddress;
    this.addressData.location.latitude = this.location.lat;
    this.addressData.location.longitude = this.location.lng;
    this.showMap = false;
    this.hideEdit = false;
  }

  // get's user address list
  private getUserAddressList(): void {
    const address$ = this.checkoutService.getAddress();
    const addressTypes$ = this.checkoutService.getAddressTypeList();
    this.addressTypes = [];
    address$.subscribe((res: any) => {
      this.addressList = res.response_data;
      if (this.cartInfo.deliveryCharges === 0) {
        this.selectedAddress = null;
      }
      if (this.cartInfo && this.cartInfo.deliveryAddress) {
        this.selectedAddress = this.cartInfo.deliveryAddress;
      }
    });
    addressTypes$.subscribe((res: any) => {
      if (res.response_code === 200) {
        for (let val in res.response_data) {
          this.addressTypes.push(res.response_data[val]);
        }
      }
    })
  }

  // opens address modal
  public openAddressModal(content: TemplateRef<string>, addressId: string) {
    this.selectedAddress = addressId;
    navigator.geolocation.getCurrentPosition(coOrdinates => {
      let address;
      if (this.selectedAddress) {
        address = this.addressList.find(a => a._id === this.selectedAddress);
      }
      this.addressData = this.getDefaultAddressValues(address);
      if (address) {
        this.addressId = address._id;
        this.mapAddress = this.addressData.address;
        this.showMap = false;
        this.hideEdit = false;
        this.modalRef = this.modalService.open(content, {keyboard: false, backdrop: false});
      } else {
        this.location.lat = coOrdinates.coords.latitude;
        this.location.lng = coOrdinates.coords.longitude;
        this.fetchAddress(this.location.lat, this.location.lng);
        this.modalRef = this.modalService.open(content, {keyboard: false, backdrop: false});
        this.mapAddress = null;
        this.showMap = true;
      }
      this.hideEdit = false;
    }, error => {
      let address;
      if (this.selectedAddress) {
        address = this.addressList.find(a => a._id === this.selectedAddress);
      }
      if (!address) {
        this.addressData = this.getDefaultAddressValues();
        this.location.lat = this.adminLocation[0];
        this.location.lng = this.adminLocation[1];
        this.mapAddress = null;
        this.fetchAddress(this.location.lat, this.location.lng);
        this.modalRef = this.modalService.open(content, {keyboard: false, backdrop: false});
      } else {
        this.addressData = this.getDefaultAddressValues(address);
        this.mapAddress = this.addressData.address;
        this.showMap = false;
        this.hideEdit = false;
        this.addressId = address._id;
        this.modalRef = this.modalService.open(content, {keyboard: false, backdrop: false});
      }
    });
  }

  // closes address model
  public closeAddressModal(): void {
    this.modalService.dismissAll();
    this.addressData = this.getDefaultAddressValues(undefined);
    this.addressId = null;
  }

  // calls when map marker is dragged
  public markerDraggedEvent(data): void {
    this.location.lat = data.lat;
    this.location.lng = data.lng;
    this.fetchAddress(data.lat, data.lng);
  }

  // geo-coders address by co-ordinates
  private fetchAddress(latitude: number, longitude: number): void {
    this.helperService.getLocationInfoByCoOrdinates(latitude, longitude).subscribe((res: any) => {
      if (res.status === 'OK') {
        this.mapAddress = res.results[0].formatted_address;
        const postalCode = res.results[0].address_components.find(data => data.types.includes('postal_code'));
        this.addressData.postalCode = postalCode ? postalCode.long_name : '';
        this.showMap = true;
      } else {
        if (res.error_message) {
          return this.helperService.errorToast(res.error_message, true);
        }
        this.showMap = true;
        this.helperService.errorToast("MAP_ERROR");
      }
    }, () => {
      this.showMap = true;
      this.helperService.errorToast("MAP_ERROR");
    });
  }

  // sends request to save address
  public geoCodeAddress(): void {
    this.checkOperationType();
  }

  // check's operation type before making the api call
  private checkOperationType() {
    if (!this.addressId) {
      this.saveAddress();
    } else {
      this.updateAddress();
    }
  }

  // sends request to save address
  private saveAddress(): void {
    this.checkoutService.saveAddress(this.addressData).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.closeAddressModal();
      this.getUserAddressList();
    });
  }

  // sends request to update address
  private updateAddress(): void {
    this.checkoutService.updateAddress(this.addressId, this.addressData).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.closeAddressModal();
      this.getUserAddressList();
    });
  }

  // sends request to delete address
  public deleteAddress(addressId: string, index: number): void {
    this.checkoutService.deleteAddress(addressId).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.addressList.splice(index, 1);
    });
  }

  // sends request to get user's delivery charges
  public getDeliveryCharges(address: AddressModel, event): void | ActiveToast<any> {
    this.selectedAddress = address._id;
    let deliveryTaxBody: DeliveryTaxModel = <DeliveryTaxModel>Object.assign({
      deliveryAddress: this.selectedAddress
    });
    this.checkoutService.calculateDeliveryCharges(deliveryTaxBody).subscribe((res: any) => {
      this.helperService.infoToast("DEL_CHARGE");
      this.cartService.getUserCartState();
    });
  }

  // proceeds to payment page
  public proceedToPaymentPage(): void | ActiveToast<any> {
    if (!this.selectedAddress) {
      return this.helperService.errorToast("ADDR_SEL");
    }
    if (!this.isValidDeliverySlot) {
      return this.helperService.errorToast("SLOT_SEL");
    }
    const orderData = this.checkoutService.prepareOrderData(this.cartInfo._id, this.deliveryTime);
    const encodedData = btoa(btoa(btoa(JSON.stringify(orderData))));
    localStorage.setItem('orderData', encodedData);
    this.router.navigate(['payment']);
  }

  // sends request to get stores working hours
  public getStoreWorkingHours(): void {
    const currentDate = new Date();
    const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`
    this.checkoutService.getWorkingHourSlots(currentTime, currentDate.getTime()).subscribe((res: any) => {
      this.isValidDeliverySlot = false;
      this.deliveryTime = null;
      this.workingHours = res.response_data;
    });
  }

  // shows time schedule based on selected day
  public showTimeSchedule(dayId: string): void {
    const workingHourData = this.workingHours.find(workingHour => workingHour._id === dayId);
    if (workingHourData) {
      this.deliveryDate = workingHourData.date;
      this.timeSchedulesSlots = workingHourData.timings;
    }
  }

  // sets selected delivery slot
  public setSelectedDeliverySlot(): void {
    this.isValidDeliverySlot = true;
  }

  // sends request to apply coupon
  public applyCoupon(): void {
    const body = {couponCode: this.couponCode, id: this.cartInfo._id};
    this.cartService.applyCoupon(body).subscribe((res: any) => {
      this.couponCode = '';
      this.cartService.checkCartFormat(res, 'coupon')
    });
  }

  // sends request to remove coupon
  public removeCoupon(): void {
    this.cartService.removeCoupon(this.cartInfo.couponCode).subscribe((res: any) => {
      this.cartService.checkCartFormat(res, 'coupon');
    });
  }
}
