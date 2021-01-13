import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { Router } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthGuardService } from '../../../services/auth-guard.service';
import { TranslateService } from "@ngx-translate/core";
import { CartService } from "../cart/cart.service";
import { LanguagesModel } from "../../models/category.model";
import * as CartActions from '../../store/cart.action';
import { CrudService } from "../../../services/crud.service";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    trigger('sideMenuAnimation', [
      state(
        'hide',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'show',
        style({
          transform: 'translateX(-100%)',
        })
      ),
      transition('hide <=> show', animate('.6s ease')),
    ]),
  ],
})
export class SideMenuComponent implements OnInit {
  public sideMenuState: string = 'show';
  public isLoggedIn = false;      // contains user's authentication status
  public cartLength: number = 0;      // contains length of cart items

  constructor(
    private store: Store<CartState>,
    private router: Router,
    private helperService: HelperService,
    private authService: AuthGuardService,
    private translate: TranslateService,
    private cartService: CartService,
    private crud: CrudService
  ) {
    this.store.select("cartInfo").subscribe(state => {
      if (state && state.products.length > 0) {
        this.cartLength = state.products.length;
      }
    });
  }

  ngOnInit(): void {
    this.authService.obs$.subscribe((state) => {
      this.isLoggedIn = state;
    });
  }

  // cleans the session and logs out the user
  public clearSessionAndLogout(): void {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    const languages: Array<LanguagesModel> = JSON.parse(atob(localStorage.getItem('languageList')));
    languages.forEach(language => {
      if (language.isDefault === 1) {
        localStorage.setItem('language', language.languageCode);
        this.translate.use(language.languageCode);
        this.translate.setDefaultLang(language.languageCode);

      }
    })
    this.crud.setAuthToken = null;
    this.cartService.clearCart();
    this.helperService.successToast("LOGOUT");
    this.authService.activatedEmitter.next(false);
    this.router.navigate(['home']);
  }

  public createSessionAndLogIn(): void {
    this.router.navigate(['login']);
  }

  mobMenuToggle() {
    this.sideMenuState = this.sideMenuState === 'hide' ? 'show' : 'hide';
  }
}
