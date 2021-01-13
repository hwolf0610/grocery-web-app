import { Component } from '@angular/core';
import { CrudService } from './services/crud.service';
import { Store } from '@ngrx/store';
import { CartState } from './pages/store/cart.reducer';
import { HelperService } from './services/helper.service';
import { AuthGuardService } from './services/auth-guard.service';
import { TranslateService } from "@ngx-translate/core";
import { CartService } from "./pages/home/cart/cart.service";
import { SocketService } from "./services/socket.service";
import { CheckoutService } from "./pages/home/checkout/checkout.service";
import { AuthService } from "./pages/auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public cityName: string = null; // contains user's city name
  title = 'grocery-webs';

  constructor(private crud: CrudService, private store: Store<CartState>, private helperService: HelperService, public authService: AuthGuardService, private translate: TranslateService, private cartService: CartService, private socketService: SocketService, private checkoutService: CheckoutService, private authenticationService: AuthService) {
    this.helperService.getCurrencyCode();
    this.helperService.getBusinessInfo();
    if (localStorage.getItem('token')) {
      this.authService.activatedEmitter.next(true);
      this.crud.setAuthToken = atob(atob(atob(localStorage.getItem('token'))));
      this.socketService.userId = localStorage.getItem('id');
      this.helperService.getUserProfileInformation();
      this.cartService.getUserCartState();
      this.authenticationService.getAdminStoreInformation();
      this.checkoutService.getPaymentMethodSettings();
    }
    if (!this.cityName) {
      this.getUserCity();
    }
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(lang => {
      this.helperService.languageDataSubject.next(lang.translations);
    });
    navigator.geolocation.getCurrentPosition((location) => {
      console.log("LOCATION ACCESS GRANTED");
    }, (error) => {
      console.log("LOCATION ACCESS DECLINED");
    });
    var token = localStorage.getItem('token');
    if (token != null) {
      this.authService.activatedEmitter.next(true)
    } else
      this.authService.activatedEmitter.next(false)

  };

  // takes user's permission and gets current location
  public getUserCity(): void {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        this.helperService.getLocationInfoByCoOrdinates(location.coords.latitude, location.coords.longitude)
          .subscribe(
            (res: any) => {
              if (res.status !== 'OK') {
                return (this.cityName = null);
              }
              const addressComponent = res.results[0].address_components.find((data) => data.types.includes('locality'));
              if (addressComponent) {
                this.cityName = addressComponent.long_name;
                localStorage.setItem('city', this.cityName = addressComponent.long_name);
              }
            },
            (error) => {
              this.cityName = null;
            }
          );
      },
      (error) => {
        this.cityName = null;
      });
  }

}
