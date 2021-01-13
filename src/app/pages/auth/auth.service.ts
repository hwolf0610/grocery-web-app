import { Injectable } from "@angular/core";
import { CrudService } from "../../services/crud.service";
import { Observable } from "rxjs";
import { CheckoutService } from "../home/checkout/checkout.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private crud: CrudService, private checkoutService: CheckoutService) {
  }

  // login user
  public validateCredentials(credentials): Observable<any> {
    return this.crud.saveData('/users/login-phone', credentials);
  }

  // registers a new user
  public registerNewUserData(registrationData): Observable<any> {
    return this.crud.saveData('/users/register-phone', registrationData);
  }

  // otp verify
  public otpVerify(registrationData): Observable<any> {
    return this.crud.saveData('/users/verify-otp/number', registrationData);
  }

  // verifies user's phone number
  public verifyPhoneNumber(body): Observable<any> {
    return this.crud.saveData(`/users/send-otp-phone`, body);
  }

  // resets users password
  public resetPassword(passwordData): Observable<any> {
    return this.crud.saveData('/users/reset-password-number', passwordData);
  }

  // get's admin store information
  public getAdminStoreInformation(): void {
    this.crud.getData('/settings/details').subscribe((res: any) => {
      const coOrdinates = [res.response_data.location.latitude, res.response_data.location.longitude]
      this.checkoutService.setStoreLocationInfo(coOrdinates);
    });
  }
}
