import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CartState } from '../pages/store/cart.reducer';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { UserInfoModel } from '../pages/models/auth.model';
import { ToastrService } from "ngx-toastr";
import { CheckoutService } from "../pages/home/checkout/checkout.service";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private googleApiCoOridnateUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';      // url used to get user's address based on co-ordinates
  private userId: string = null;      // contains id of the logged in user


  private userInfoSubject = new BehaviorSubject<UserInfoModel>(null);        // contains logged in user's information
  public user$ = this.userInfoSubject.asObservable();

  private currencySubject = new BehaviorSubject<string>("USD");     // contains the currency code set by admin in cms
  public currency$ = this.currencySubject.asObservable();     // subscribes to the latest currency value

  private logoSubject = new BehaviorSubject<string>(null);     // contains the web app logo set by admin in cms
  public logo$ = this.logoSubject.asObservable();     // subscribes to the latest logo url

  private profilePicSubject = new BehaviorSubject<string>(null);     // contains the web app logo set by admin in cms
  public profilePic$ = this.profilePicSubject.asObservable();     // subscribes to the latest logo url

  public languageDataSubject = new BehaviorSubject<any>(null);       // contains language JSON of the selected languages
  public language$ = this.languageDataSubject.asObservable();     // subscribes to the latest language JSON

  private languageJSON: any;      // contains translated json of selected language

  private businessInfoSubject$ = new BehaviorSubject<any>(null);       // contains business info data
  public businessInfo$ = this.businessInfoSubject$.asObservable();

  private currencyCode: string = null;      // contains currency code

  constructor(private crud: CrudService, private store: Store<CartState>, private http: Http, private toastr: ToastrService, private checkoutService: CheckoutService, private socketService: SocketService) {
    this.userId = localStorage.getItem('id');
    this.language$.subscribe(json => {
      if (json) {
        this.languageJSON = json;
      }
    });
    this.currency$.subscribe(currency => {
      this.currencyCode = currency;
    })
  }


  // set's language JSON of selected language
  public setLanguageJSON(languageObs): void {
    languageObs.subscribe(json => {
      this.languageDataSubject.next(json);
    });
  }


  // set's currency code
  public setCurrencyCode(currencyCode: string): void {
    this.currencySubject.next(currencyCode);
  }


  // get's currency codes
  public getCurrencyCode(): void {
    this.crud.getData('/settings/details').subscribe((res: any) => {
      this.setCurrencyCode(res.response_data.currencyCode);
    });
  }

  // get's business info
  public getBusinessInfo(): void {
    this.crud.getData('/business/detail').subscribe((res: any) => {
      this.businessInfoSubject$.next(Array.isArray(res.response_data) ? res.response_data[0] : res.response_data);
    }, error => {
      this.logoSubject.next('/assets/icons/logo.png');
    });
  }

  // sends request to get's users profile information
  public getUserProfileInformation(): void {
    const user$ = this.crud.getData('/users/me');
    user$.subscribe((res: any) => {
      localStorage.setItem('id', res.response_data._id);
      this.socketService.establishSocketConnection();
      this.userInfoSubject.next(res.response_data);
      if (res.response_data.walletAmount !== null && res.response_data.walletAmount !== undefined) {
        this.checkoutService.setWalletBalance(res.response_data.walletAmount);
      }
    });
  }


  // get's location information through latitude and longitude
  public getLocationInfoByCoOrdinates(latitude: number, longitude: number): Observable<any> {
    return this.http.get(`${this.googleApiCoOridnateUrl}${latitude},${longitude}&key=${environment.GOOGLE_MAP_API_KEY}`).pipe(map(res => res.json()), catchError(error => EMPTY));
  }


  // takes browser scroll bar to top
  public scrollTop(): void {
    window.scrollTo(0, 0);
  }

  // shows success toast
  public successToast(message: string, isApiRes?: boolean): void {
    this.toastr.success(isApiRes ? message : this.languageJSON[message], '', { timeOut: 4000 });
  }

  // shows error toast
  public errorToast(message: string, isApiRes?: boolean): void {
    this.toastr.error(isApiRes ? message : this.languageJSON[message], '', { timeOut: 4000 });
  }

  // shows info toast
  public infoToast(message: string, isApiRes?: boolean, extra?: number): void {
    this.toastr.info(isApiRes ? message : this.languageJSON[message] + ` ${this.currencyCode} ` + +(extra ? extra : ''), '', { timeOut: 4000 });
  }

  // getting  country code data from json
  public getCountryCodeData(): Observable<any> {
    return this.http.get("assets/country-code.json");
  }

}
