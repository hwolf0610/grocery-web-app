import { Component, OnInit } from '@angular/core';
import { RegistrationModel, OTPModel } from '../../models/auth.model';
import { Router } from '@angular/router';
import { HelperService } from "../../../services/helper.service";
import { TranslateService } from "@ngx-translate/core";
import { FormControl, FormGroup, Validators, NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  public registrationForm: FormGroup;     // contains registration form instance
  public isRegistered: boolean = false;     // shows OTP input when true
  public otpSent = false;
  public countryCode = '';
  public countryName = '';
  public registrationData: RegistrationModel = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    role: 'User',
    email: '',
    password: '',
    countryCode: '',
    countryName: ''
  }

  public otpInfo: OTPModel = {
    mobileNumber: '',
    otp: '',
    sId: ''
  }
  public countryCodeArray = [];

  constructor(
    private router: Router,
    private helperService: HelperService,
    private translate: TranslateService,
    private authService: AuthService
  ) {

  }
  resendOtp() {
    const body = Object.assign({ mobileNumber: this.registrationForm.value.mobileNumber });
    this.authService.verifyPhoneNumber(body).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.otpInfo.mobileNumber = this.registrationForm.value.mobileNumber;;
      this.otpInfo.sId = res.sId;
      this.otpSent = false;
    });

  }
  handleEvent(event) {
    if (event.action === "done")
      this.otpSent = true;
  }

  ngOnInit(): void {
    this.buildRegistrationForm();
    const language = localStorage.getItem('language');
    if (language) {
      this.translate.use(language);
      this.translate.setDefaultLang(language);
    }
    this.helperService.getCountryCodeData().subscribe((res: any) => {
      this.countryCodeArray = JSON.parse(res._body).countryCode;
    })
  }

  // build registration form
  public buildRegistrationForm(): void {
    this.registrationForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      mobileNumber: new FormControl('', [Validators.required]),
      countryName: new FormControl(''),
      countryCode: new FormControl(''),
      role: new FormControl('User'),
      email: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(35)])
    })
  }

  // sends request to register new user
  public registerNewUser(): void {
    if (this.registrationForm.value.email == null || this.registrationForm.value.email == '') {
      delete this.registrationForm.value.email;
    }
    this.registrationForm.value.countryCode = this.countryCode;
    this.registrationForm.value.countryName = this.countryName;
    this.authService.registerNewUserData(this.registrationForm.value).subscribe((res: any) => {
      this.otpInfo.sId = res.sId;
      this.helperService.successToast(res.response_data, true);
      this.isRegistered = true;
      this.otpInfo.mobileNumber = this.registrationForm.value.mobileNumber;
    });
  }

  public verifyOTPNumber(): void {
    this.authService.otpVerify(this.otpInfo).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.router.navigate(['login']);
    });
  }
  public addCountryCode(event: any): void {
    this.countryCode = event.target.value.split(' ')[0];
    this.countryName = event.target.value.split(' ')[1];
  }
}
