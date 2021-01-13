import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './pages/auth/registration/registration.component';
import { WelcomeComponent } from './pages/auth/welcome/welcome.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswdComponent } from './pages/auth/forgot-passwd/forgot-passwd.component';
import { ResetPasswdComponent } from './pages/auth/reset-passwd/reset-passwd.component';
import { VerifyNumberComponent } from './pages/auth/verify-number/verify-number.component';
import { HomeComponent } from './pages/home/home/home.component';
import { MyStoreComponent } from './pages/home/my-store/my-store.component';
import { SavedItemsComponent } from './pages/home/saved-items/saved-items.component';
import { CartComponent } from './pages/home/cart/cart.component';
import { CategoriesComponent } from './pages/home/categories/categories.component';
import { OrdersComponent } from './pages/home/orders/orders.component';
import { ShowResultComponent } from './pages/home/show-result/show-result.component';
import { CheckoutComponent } from './pages/home/checkout/checkout.component';
import { PaymentComponent } from './pages/home/payment/payment.component';
import { ProductsComponent } from './pages/home/products/products.component';
import { ProductDetailsComponent } from './pages/home/product-details/product-details.component';
import { ProfileComponent } from './pages/home/profile/profile.component';
import { LocationComponent } from './pages/home/location/location.component';
import { ChatComponent } from './pages/home/chat/chat.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AboutUsComponent } from './pages/home/about-us/about-us.component';
import { TopDealsComponent } from './pages/home/top-deals/top-deals.component';
import { PrivacyPolicyComponent } from './pages/home/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './pages/home/terms-conditions/terms-conditions.component';
import { ThankyouPageComponent } from './pages/home/thankyou-page/thankyou-page.component';
import { WalletComponent } from './pages/home/wallet/wallet.component';
import { RateDeliveryComponent } from './pages/home/rate-delivery/rate-delivery.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'verify-number',
    component: VerifyNumberComponent,
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'register',
    component: RegistrationComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswdComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswdComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'home-page',
    component: HomeComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'home',
    component: MyStoreComponent,
  },
  {
    path: 'favourites',
    component: SavedItemsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'categories',
    component: CategoriesComponent,
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'search',
    component: ShowResultComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'products',
    component: ProductsComponent,
  },
  {
    path: 'products/by/category/:id',
    component: ProductsComponent,
  },
  {
    path: 'product-details/:id',
    component: ProductDetailsComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'current-location',
    component: LocationComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: 'deals',
    component: TopDealsComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
  },
  {
    path: 'thank-you',
    component: ThankyouPageComponent,
  },
  {
    path: 'wallet',
    component: WalletComponent,
  },
  {
    path: 'rate-delivery/:id',
    component: RateDeliveryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
