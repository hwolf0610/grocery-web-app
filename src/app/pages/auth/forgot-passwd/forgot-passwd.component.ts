import { Component, OnInit } from '@angular/core';
import { CrudService } from "../../../services/crud.service";
import { Router } from "@angular/router";
import { HelperService } from "../../../services/helper.service";
import { TranslateService } from "@ngx-translate/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { OTPModel } from '../../models/auth.model';

@Component({
  selector: 'app-forgot-passwd',
  templateUrl: './forgot-passwd.component.html',
  styleUrls: ['./forgot-passwd.component.scss']
})
export class ForgotPasswdComponent implements OnInit {
  public number: string = '';     // contains user's 
  public mobileNumber: string = '';
  public otp: string = '';     // contains user's otp sent to their email
  public password: string = '';      // contains user's new password
  public verificationLevels = {
    emailVerified: false,
    otpVerified: false
  }     // set to true when respective credentials are verified
  public forgotPasswordForm: FormGroup;       // contains forget-password form group instance
  private verificationToken: string = null;     // contains verification token
  public otpInfo: OTPModel = {
    mobileNumber: '',
    otp: '',
    sId: ''
  }

  constructor(
    private crud: CrudService,
    private router: Router,
    private helperService: HelperService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
  }

  // build's forgot-password form
  public buildForgotPasswordForm(): void {
    this.forgotPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(35)]),
    });
  }

  ngOnInit(): void {
    this.buildForgotPasswordForm();
    const language = localStorage.getItem('language');
    if (language) {
      this.translate.use(language);
      this.translate.setDefaultLang(language);
    }
  }

  // send request to verify user's email
  public verifyMobile(): void {
    const body = Object.assign({ mobileNumber: this.mobileNumber });
    this.authService.verifyPhoneNumber(body).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.otpInfo.mobileNumber = this.mobileNumber;
      this.otpInfo.sId = res.sId;
      this.mobileNumber = this.mobileNumber;
      this.verificationLevels.emailVerified = true;
    });
  }

  // send request to verify user's email
  public verifyOTP(): void {
    this.authService.otpVerify(this.otpInfo).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.verificationToken = res.verificationToken;
      this.verificationLevels.otpVerified = true;
    });
  }

  // send request to verify user's email
  public resetPassword(): void {
    const body = Object.assign({
      newPassword: this.forgotPasswordForm.value.newPassword,
      mobileNumber: this.mobileNumber,
      verificationToken: this.verificationToken
    });
    this.authService.resetPassword(body).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.goToLoginPage();
    });
  }

  // navigates user to login page
  public goToLoginPage(): void {
    this.router.navigate(['login']);
  }

}
