import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { UserInfoModel } from '../../models/auth.model';
import { HelperService } from '../../../services/helper.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { CartState } from '../../store/cart.reducer';
import { AuthGuardService } from '../../../services/auth-guard.service';
import { LanguagesModel } from "../../models/category.model";
import { ProfileService } from "../profile/profile.service";

@Component({
  selector: 'app-header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
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
export class HeaderComponent implements OnInit {
  public userInfo: UserInfoModel; // contains information about logged in user
  public defaultProfilePic: string = 'assets/images/default_user.png';        // user default profile picture
  @Output() directionEvent = new EventEmitter<Object>();
  public languageCode: string = 'en'; // contains selected language code

  public sideMenuState: string = 'show';
  public cartLength: number = 0; // contains number of items in cart
  public cityName: string = localStorage.getItem('city'); // contains user's city name
  public isLoggedIn: boolean = false; // set to true if user is logged in
  public languages: Array<LanguagesModel> = [];      // contains list of languages added from CMS

  constructor(
    private helperService: HelperService,
    private translate: TranslateService,
    private store: Store<CartState>,
    private auth: AuthGuardService,
    private profileService: ProfileService
  ) {
    if (localStorage.getItem('languageList')) {
      this.languages = JSON.parse(atob(localStorage.getItem('languageList')))
    }
    this.getUserInformation();
    this.languageCode = localStorage.getItem('language');
    if (!this.languageCode) {
      const defaultLangInfo = this.languages.find(language => language.isDefault === 1);
      this.languageCode = defaultLangInfo.languageCode;
    }
    this.ChangeLanguage();
    this.store.select('cartInfo').subscribe((cart) => {
      if (cart) {
        this.cartLength = cart.products.length;
      }
    });
    this.auth.obs$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  ngOnInit(): void {
    this.helperService.profilePic$.subscribe((url) => {
      if (url) {
        this.userInfo.imageUrl = url;
      }
    });
  }

  // sends request to get logged in user's information
  private getUserInformation(): void {
    this.helperService.user$.subscribe((data) => {
      if (data) {
        this.userInfo = data;
      }
    });
  }

  // sets selected language as default language
  public ChangeLanguage(): void {
    const defaultLang = this.translate.getDefaultLang()
    if (defaultLang !== this.languageCode) {
      localStorage.setItem('language', this.languageCode);
      this.translate.use(this.languageCode);
      this.translate.setDefaultLang(this.languageCode);
      if (localStorage.getItem('token')) {
        const body = {
          language: this.languageCode
        }
        this.profileService.setDefaultLanguage(body).subscribe((res: any) => {
          console.log("LANG CHANGED");
        });
      }
    }
  }

  mobMenuToggle() {
    this.sideMenuState = this.sideMenuState === 'hide' ? 'show' : 'hide';
  }
}
