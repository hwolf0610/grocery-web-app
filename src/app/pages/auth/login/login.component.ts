import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../services/crud.service';
import { LoginModel, OTPModel } from '../../models/auth.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { HelperService } from '../../../services/helper.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CartService } from "../../home/cart/cart.service";
import { SocketService } from "../../../services/socket.service";
import { AuthService } from "../auth.service";
import { CheckoutService } from "../../home/checkout/checkout.service";
import { LanguagesModel } from "../../models/category.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private redirectPath: string = null; // contains redirect url
  public loginForm: FormGroup;      // contains login form instance
  public isAccountNotVerified: boolean = false;     // set t true when user's email is not verified
  private number: string = null;     // contains user's mobile no
  public isLinkSent: boolean = false;     // shows OTP input when true
  private email: string = null;     // contains user's email
  public verificationLevels = {
    emailVerified: false,
    otpVerified: false
  }   // set to true when respective credentials are verified

  public otpInfo: OTPModel = {
    mobileNumber: '',
    otp: '',
    sId: ''
  }

  constructor(
    private crud: CrudService,
    private router: Router,
    private store: Store<CartState>,
    private helperService: HelperService,
    public authService: AuthGuardService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private cartService: CartService,
    private socketService: SocketService,
    private authenticationService: AuthService,
    private checkoutService: CheckoutService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.redirectPath = params.redirectTo;
    });
    if (localStorage.getItem('token')) {
      const role = atob(atob(atob(localStorage.getItem('role'))));
      if (role === 'User') {
        this.router.navigate(['home']);
      }
    }
  }

  // build login form
  private buildLoginForm(): void {
    let userName = "";
    let password = "";
    if (environment['PREDEFINED'] && environment['PREDEFINED'] == true) {
      userName = '';
      password = '';
    }

    this.loginForm = new FormGroup({
      userName: new FormControl(userName, [Validators.required]),
      password: new FormControl(password, [Validators.required, Validators.minLength(5), Validators.maxLength(35)])
    })
  }

  ngOnInit(): void {
    this.buildLoginForm();
    const language = localStorage.getItem('language');
    if (language) {
      this.translate.use(language);
      this.translate.setDefaultLang(language);
    }
  }

  // send's request to server to validate user credentials
  public validateUserCredentials(): void {
    this.authenticationService.validateCredentials(this.loginForm.value).subscribe((res: any) => {
      if (res.response_code === 205) {
        this.helperService.errorToast(res.response_data, true);
        return this.isAccountNotVerified = true;
      }
      this.isAccountNotVerified = false;
      if (res.response_code !== 200) {
        return this.helperService.errorToast(res.response_data, true);
      }
      this.loginForm.reset();
      if (res.response_data.role !== 'USER') {
        return this.helperService.errorToast("UNAUTHORIZED")
      }
      if (res.response_data.language) {
        const languages: Array<LanguagesModel> = JSON.parse(atob(localStorage.getItem('languageList')))
        const checkLanguage = languages.find(language => language.languageCode === res.response_data.language);
        if (checkLanguage) {
          localStorage.setItem('language', res.response_data.language);
        }
      }
      const encodedToken = btoa(btoa(btoa(res.response_data.token)));
      const encodedRole = btoa(btoa(btoa(res.response_data.role)));
      localStorage.setItem('token', encodedToken);
      this.crud.setAuthToken = res.response_data.token;
      localStorage.setItem('role', encodedRole);
      localStorage.setItem('id', res.response_data._id);
      this.cartService.getUserCartState();
      this.helperService.getUserProfileInformation();
      this.checkoutService.getPaymentMethodSettings();
      this.authService.activatedEmitter.next(true);
      this.helperService.successToast("LOGIN");
      if (!this.redirectPath) {
        this.router.navigate(['home']);
      } else {
        this.router.navigate([this.redirectPath]);
      }
    }, error => {
      console.log("ERROR BLOCK HIT");
    });
  }

  //resend's activation email
  public resendVerificationOTPMessage(): void {
    const body = Object.assign({ mobileNumber: this.loginForm.value.userName });
    this.authenticationService.verifyPhoneNumber(body).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.otpInfo.mobileNumber = this.loginForm.value.userName;
      this.otpInfo.sId = res.sId;
      this.loginForm.reset();
      this.isAccountNotVerified = false;
      this.isLinkSent = true;
      this.verificationLevels.emailVerified = true;
    });
  }

  public verifyOTP(): void {
    this.authenticationService.otpVerify(this.otpInfo).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.isAccountNotVerified = false;
      this.isLinkSent = false;
      this.verificationLevels.otpVerified = true;
    });

  }
}
