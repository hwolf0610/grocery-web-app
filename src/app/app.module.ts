import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './pages/auth/registration/registration.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { WelcomeComponent } from './pages/auth/welcome/welcome.component';
import { ForgotPasswdComponent } from './pages/auth/forgot-passwd/forgot-passwd.component';
import { ResetPasswdComponent } from './pages/auth/reset-passwd/reset-passwd.component';
import { StartupComponent } from './pages/auth/startup/startup.component';
import { VerifyNumberComponent } from './pages/auth/verify-number/verify-number.component';
import { HomeComponent } from './pages/home/home/home.component';
import { SideMenuComponent } from './pages/home/side-menu/side-menu.component';
import { MyStoreComponent } from './pages/home/my-store/my-store.component';
import { SavedItemsComponent } from './pages/home/saved-items/saved-items.component';
import { CartComponent } from './pages/home/cart/cart.component';
import { CategoriesComponent } from './pages/home/categories/categories.component';
import { OrdersComponent } from './pages/home/orders/orders.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { RatingModule } from 'ng-starrating';
import { ShowResultComponent } from './pages/home/show-result/show-result.component';
import { CheckoutComponent } from './pages/home/checkout/checkout.component';
import { NgbDatepickerModule, NgbModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { PaymentComponent } from './pages/home/payment/payment.component';
import { ProductsComponent } from './pages/home/products/products.component';
import { ProductDetailsComponent } from './pages/home/product-details/product-details.component';
import { ProfileComponent } from './pages/home/profile/profile.component';
import { ChatComponent } from './pages/home/chat/chat.component';
import { LocationComponent } from './pages/home/location/location.component';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './pages/store/cart.reducer';
import { RequestInterceptorService } from './services/request-interceptor.service';
import { HttpModule } from '@angular/http';
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { FileUploadModule } from 'ng2-file-upload';
import { HeaderComponent } from './pages/home/header/header.component';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateLoader, TranslateStore, TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './pages/home/footer/footer.component';
import { AboutUsComponent } from './pages/home/about-us/about-us.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TopDealsComponent } from './pages/home/top-deals/top-deals.component';
import { environment } from "../environments/environment";
import { CustomLoader } from "./services/custom-loader";
import { CrudService } from "./services/crud.service";
import { LanguagesModel } from "./pages/models/category.model";
import { HelperService } from "./services/helper.service";
import { AgmCoreModule } from "@agm/core";
import { TermsConditionsComponent } from './pages/home/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './pages/home/privacy-policy/privacy-policy.component';
import { ThankyouPageComponent } from "./pages/home/thankyou-page/thankyou-page.component";
import { CountdownModule } from 'ngx-countdown';
import { WalletComponent } from './pages/home/wallet/wallet.component';
import { RateDeliveryComponent } from './pages/home/rate-delivery/rate-delivery.component';


export function getLanguageList(http: HttpClient) {
  return () => {
    return http.get(`${environment.API_ENDPOINT}/languages/list`).toPromise().then((data: any) => {
      if (data.response_code === 200) {
        const languages: Array<LanguagesModel> = data.response_data;
        languages.forEach(lang => {
          if (lang.isDefault) {
            if (!localStorage.getItem('token')) {
              localStorage.setItem('language', lang.languageCode);
            }
          }
        });
        localStorage.setItem('languageList', btoa(JSON.stringify(data.response_data)));
      }
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    WelcomeComponent,
    ForgotPasswdComponent,
    ResetPasswdComponent,
    StartupComponent,
    VerifyNumberComponent,
    HomeComponent,
    SideMenuComponent,
    MyStoreComponent,
    SavedItemsComponent,
    CartComponent,
    CategoriesComponent,
    OrdersComponent,
    ShowResultComponent,
    CheckoutComponent,
    PaymentComponent,
    ProductsComponent,
    ProductDetailsComponent,
    ProfileComponent,
    ChatComponent,
    LocationComponent,
    HeaderComponent,
    FooterComponent,
    AboutUsComponent,
    TopDealsComponent,
    TermsConditionsComponent,
    PrivacyPolicyComponent,
    ThankyouPageComponent,
    WalletComponent,
    RateDeliveryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CarouselModule,
    CountdownModule,
    BrowserAnimationsModule,
    RatingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    StoreModule.forRoot({ cartInfo: cartReducer }, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: false,
        strictStateSerializability: true,
        strictActionSerializability: true
      }
    }),
    HttpModule,
    CreditCardDirectivesModule,
    ReactiveFormsModule,
    FileUploadModule,
    NgbRatingModule,
    NgbDatepickerModule,
    ToastrModule.forRoot(),
    TranslateModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: CustomLoader,
        deps: [CrudService, HelperService]
      }
    }),
    InfiniteScrollModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLE_MAP_API_KEY
    })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorService, multi: true },
  {
    provide: APP_INITIALIZER,
    useFactory: getLanguageList,
    deps: [HttpClient],
    multi: true
  },
    TranslateStore,
    TranslateService
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
}
