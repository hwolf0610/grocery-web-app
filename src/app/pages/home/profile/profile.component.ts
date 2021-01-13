import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../../services/helper.service';
import { MessageModel } from '../../models/chat.model';
import { Router } from '@angular/router';
import { OTPModel, UserInfoModel } from '../../models/auth.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AddressModel } from '../../models/order.model';
import { LanguagesModel } from "../../models/category.model";
import { CartService } from "../cart/cart.service";
import { SocketService } from "../../../services/socket.service";
import { CheckoutService } from "../checkout/checkout.service";
import { ProfileService } from "./profile.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public verifyMobileNumber: boolean = false    //set to true when otp of mobileNumber updation is sent
  public profileUpdateForm: FormGroup;      // create a reactive form for profile update section
  private modalRef: NgbModalRef;      // contains modal update profile reference
  public addressList: Array<AddressModel> = [];        // contains list of addresses
  public addressData: AddressModel;     // contains address information
  public addressId: string = null;      // contains address id of selected address
  public selectedAddress: AddressModel;     // contains information of selected address
  public defaultProfilePic: string = 'assets/images/default_user.png';        // user default profile picture
  public profileImage: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-160`;      // contains optimized profile image url
  public isDisabled: boolean = false;     // disables button when true
  public languageList: Array<LanguagesModel> = [];      // contains list of language set by admin
  public showMap: boolean = false;     //    set to true when address is fetched from the geocoding api
  public hideEdit: boolean = false;     //    set to true when address is fetched from the geocoding api
  public mapAddress: string = null;      // contains map address
  public location = {
    lat: null,
    lng: null
  };      // contains current and updated location information
  public adminLocation: Array<number> = [];     // contains store location information
  public walletBalance: number = 0;       // contains user's wallet balance
  public currencyCode: string = null;     // contains users currency code
  public changePasswordForm: FormGroup;     // contains change password form instance
  public addressTypes: Array<string> = [];      // contains list of address types
  public otpInfo: OTPModel = {
    mobileNumber: '',
    sId: '',
    otp: '',
  }                      // contains otp 

  public profileInfo: UserInfoModel = {
    location: {
      type: null,
      coordinates: []
    },
    _id: null,
    deliveryAreaCode: [],
    firstName: null,
    lastName: null,
    email: null,
    mobileNumber: null,
    role: null,
    freeDeliveryDistance: null,
    deliveryCharge: null,
    deliveryDistanceUnit: null,
    registrationDate: null,
    emailVerified: null,
    verificationId: null,
    deliverytimingslot: null,
    createdAt: null,
    updatedAt: null,
    imageUrl: null,
    filePath: null,
    language: ''
  }

  constructor(private modalService: NgbModal, private helperService: HelperService, private router: Router, private cartService: CartService, private socketService: SocketService, private checkoutService: CheckoutService, private profileService: ProfileService) {
    this.helperService.currency$.subscribe(currency => {
      this.currencyCode = currency;
    });
    this.checkoutService.wallet$.subscribe(walletBalance => {
      if (walletBalance) {
        this.walletBalance = walletBalance;
      }
    });
    this.checkoutService.store$.subscribe(data => {
      if (data) {
        this.adminLocation = data;
      }
    });

    if (localStorage.getItem('languageList')) {
      this.languageList = JSON.parse(atob(localStorage.getItem('languageList')));
    }
    this.addressData = this.getDefaultAddressValues();
    this.buildChangePasswordForm();
    this.getUserProfileInfo();
    this.getUserAddressList();
  }

  // opens change password modal
  public openChangePasswordModal(modalRef: TemplateRef<any>): void {
    this.modalService.open(modalRef, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }

  // sends request to change password
  public changePassword(): void {
    this.profileService.changePassword(this.changePasswordForm.value).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.clearSessionAndLogout();
    });
  }

  // closes change password modal
  public closeChangePasswordModal(): void {
    this.modalService.dismissAll();
    this.changePasswordForm.reset();
  }

  // build change password form instance
  private buildChangePasswordForm(): void {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(35)]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(35)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(35)])
    });
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
      location: address ? address.location : { latitude: null, longitude: null }
    };
  }

  // builds profile update form
  public buildProfileUpdateForm(): void {
    this.profileUpdateForm = new FormGroup({
      firstName: new FormControl(this.profileInfo.firstName, [Validators.required]),
      lastName: new FormControl(this.profileInfo.lastName, [Validators.required]),
      email: new FormControl(this.profileInfo.email),
      imageUrl: new FormControl(this.profileInfo.imageUrl),
      filePath: new FormControl(this.profileInfo.filePath ? this.profileInfo.filePath : ''),
      mobileNumber: new FormControl(this.profileInfo.mobileNumber, [Validators.required])
    });
  }

  // get's user address list
  private getUserAddressList(): void {
    const address$ = this.checkoutService.getAddress();
    const addressTypes$ = this.checkoutService.getAddressTypeList();
    this.addressTypes = [];
    address$.subscribe((res: any) => {
      this.addressList = res.response_data;
      this.selectedAddress = undefined;
    });
    addressTypes$.subscribe((res: any) => {
      if (res.response_code === 200) {
        for (let val in res.response_data) {
          this.addressTypes.push(res.response_data[val]);
        }
      }
    })
  }

  // contains user's profile information
  private getUserProfileInfo(): void {
    this.profileService.getUserProfileInformation().subscribe((res: any) => {
      this.profileInfo = res.response_data.userInfo ? res.response_data.userInfo : res.response_data;
      if (this.profileInfo.filePath && !this.profileInfo.imageUrl) {
        this.profileInfo.imageUrl = `${this.profileImage}/${this.profileInfo.filePath}`
      }
    });
  }

  // opens profile update modal
  public openProfileUpdateModal(content: TemplateRef<any>): void {
    this.buildProfileUpdateForm();
    this.modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }

  // opens profile update modal
  public openProfileMobileNumberUpdateModal(content: TemplateRef<any>): void {
    this.buildProfileUpdateForm();
    this.modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
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

  // opens file picker
  public openFilePicker(): void {
    const inputEle = document.getElementById('file-picker');
    if (inputEle) {
      inputEle.click();
    }
  }

  // read's selected file
  public readImage(event): void {
    if (event.target.files.length > 0) {
      this.isDisabled = true;
      let formData = new FormData();
      formData.append('file', event.target.files[0]);
      this.profileService.uploadImage(formData).subscribe((res: any) => {
        this.isDisabled = false;
        if (res.response_code === 200) {
          this.profileUpdateForm.controls['imageUrl'].patchValue(res.response_data.url);
          this.profileUpdateForm.controls['filePath'].patchValue(res.response_data.filePath);
        }
      }, () => {
        this.isDisabled = false;
        this.helperService.errorToast("IMG_UP_FAIL");
      })
    }
  }

  // sends request to update profile
  public updateProfile() {
    this.profileInfo.firstName = this.profileUpdateForm.value.firstName;
    this.profileInfo.lastName = this.profileUpdateForm.value.lastName;
    this.profileInfo.mobileNumber = String(this.profileUpdateForm.value.mobileNumber);
    this.profileInfo.imageUrl = this.profileUpdateForm.value.imageUrl;
    this.profileInfo.filePath = this.profileUpdateForm.value.filePath;
    this.profileInfo.email = this.profileUpdateForm.value.email;
    this.profileService.updateUserProfile(this.profileInfo).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.closeModal();
      this.helperService.getUserProfileInformation();
      this.getUserProfileInfo();
    });
  }

  // geo-coders address by co-ordinates
  private fetchAddress(latitude: number, longitude: number, content?: TemplateRef<any>): void {
    if (!latitude || !longitude) {
      latitude = this.adminLocation[0];
      longitude = this.adminLocation[1];
    }
    this.helperService.getLocationInfoByCoOrdinates(latitude, longitude).subscribe((res: any) => {
      if (res.status === 'OK') {
        if (content) {
          this.modalRef = this.modalService.open(content, { backdrop: false, keyboard: false });
        }
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

  // sets map show status
  public setMapShowStatus(): void {
    this.showMap = !this.showMap;
    this.mapAddress = this.addressData.address;
    this.location = { lat: this.addressData.location.latitude, lng: this.addressData.location.longitude };
    this.hideEdit = this.showMap === false;
  }

  // opens address modal
  public openAddressModal(content: TemplateRef<string>) {
    navigator.geolocation.getCurrentPosition(coOrdinates => {
      let address;
      if (this.selectedAddress) {
        address = this.addressList.find(a => a._id === this.selectedAddress._id)
      }
      this.addressData = this.getDefaultAddressValues(address);
      if (address) {
        this.addressId = address._id;
        this.mapAddress = this.addressData.address;
        this.showMap = false;
        this.hideEdit = false;
        this.modalRef = this.modalService.open(content, { keyboard: false, backdrop: false });
      } else {
        this.location.lat = coOrdinates.coords.latitude;
        this.location.lng = coOrdinates.coords.longitude;
        this.fetchAddress(this.location.lat, this.location.lng, content);
        this.mapAddress = null;
        this.showMap = true;
      }
      this.hideEdit = false;
    }, error => {
      let address;
      if (this.selectedAddress) {
        address = this.addressList.find(a => a._id === this.selectedAddress._id)
      }
      if (!address) {
        this.addressData = this.getDefaultAddressValues();
        this.location.lat = this.adminLocation[0];
        this.location.lng = this.adminLocation[1];
        this.mapAddress = null;
        this.fetchAddress(this.location.lat, this.location.lng, content);
      } else {
        this.addressData = this.getDefaultAddressValues(address);
        this.mapAddress = this.addressData.address;
        this.showMap = false;
        this.hideEdit = false;
        this.addressId = address._id;
        this.modalRef = this.modalService.open(content, { keyboard: false, backdrop: false });
      }
    });
  }

  // navigates to chat page
  public navigateToChat(): void {
    window.location.href = 'chat';
  }

  // calls when map marker is dragged
  public markerDraggedEvent(data): void {
    this.location.lat = data.lat;
    this.location.lng = data.lng;
    this.fetchAddress(data.lat, data.lng);
  }

  // check's operation type before making the api call
  private checkOperationType() {
    this.addressData.user = this.profileInfo._id;
    if (!this.addressId) {
      this.saveAddress();
    } else {
      this.updateAddress();
    }
  }

  // set's map address
  public setMapAddress(): void {
    this.addressData.address = this.mapAddress;
    this.addressData.location.latitude = this.location.lat;
    this.addressData.location.longitude = this.location.lng;
    this.showMap = false;
    this.hideEdit = false;
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
  public deleteAddress(): void {
    this.checkoutService.deleteAddress(this.selectedAddress._id).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.getUserAddressList();
    });
  }

  // closes address model
  public closeAddressModal(): void {
    this.modalService.dismissAll();
    this.addressData = this.getDefaultAddressValues(undefined);
    this.addressId = null;
    this.selectedAddress = undefined;
  }

  // closes profile update modal
  public closeModal(): void {
    this.modalRef.close();
    this.profileUpdateForm.reset();
  }

  // cleans the session and logs out the user
  public clearSessionAndLogout(): void {
    this.cartService.clearCart();
    localStorage.clear();
    window.location.href = 'home';
  }

  // sends request to save address
  public geoCodeAddress(): void {
    this.checkOperationType();
  }

  // update mobile Number
  updateMobileNumber() {
    const body = {
      mobileNumber: String(this.profileUpdateForm.value.mobileNumber)
    }
    this.profileService.updateMobileNumber(body).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.otpInfo.mobileNumber = String(this.profileUpdateForm.value.mobileNumber);
      this.otpInfo.sId = res.sId;
      this.verifyMobileNumber = true;
    })
  }
  // verify otp
  public verifyOTPNumber(): void {
    this.profileService.otpVerify(this.otpInfo).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.profileInfo.mobileNumber = String(this.profileUpdateForm.value.mobileNumber);
      this.closeModal()
      this.router.navigate(['profile']);
    });
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }
}
