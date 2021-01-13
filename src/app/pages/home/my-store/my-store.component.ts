import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';
import {
  BannerModel,
  CategoryModel,
  DealsModel,
  DealTypeEnum,
  ProductsModel,
} from '../../models/category.model';
import { Router } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { environment } from '../../../../environments/environment';
import { MyStoreService } from './my-store.service';

@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.scss'],
})
export class MyStoreComponent implements OnInit {
  ratingElement = {
    readonly: true,
    checkedcolor: 'green',
    uncheckedcolor: 'grey',
    value: 2.3,
    size: 20,
    totalstars: 5,
  };

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    autoplay: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 3,
      },
      400: {
        items: 5,
      },
      740: {
        items: 4,
      },
      940: {
        items: 10,
      },
    },
    nav: true,
  };

  limitedOffers: OwlOptions = {
    loop: true,
    autoplay: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 850,
    navText: ['', ''],
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 3,
      },
      740: {
        items: 3,
      },
      940: {
        items: 8,
      },
    },
    nav: true,
  };

  topdeals: OwlOptions = {
    loop: true,
    autoplay: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 5,
      },
      740: {
        items: 5,
      },
      940: {
        items: 5,
      },
    },
    nav: true,
  };

  banner: OwlOptions = {
    loop: true,
    autoplay: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    // autoplay: true,

    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: true,
  };

  public categoryList: Array<CategoryModel> = []; // contains list of categories
  public productsList: Array<ProductsModel> = []; // contains list of products
  public dealsList: Array<DealsModel> = []; // contains list of deals
  public currencyCode: string = null; // contains currency code
  public bannerList: Array<BannerModel> = []; // contains the list of banners
  public categoryImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-73`; // contains optimized category image url
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-192`; // contains optimized product image url
  public dealImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-181`; // contains optimized deal image url
  public bannerImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-237`; // contains optimized banner image url

  constructor(
    private myStoreService: MyStoreService,
    private router: Router,
    private helperService: HelperService
  ) {
    this.helperService.currency$.subscribe((currencyCode) => {
      this.currencyCode = currencyCode;
    });
    this.getBannerList();
    this.getHomePageData();
  }

  // get's banners list
  private getBannerList(): void {
    const banner$ = this.myStoreService.getBannerList();
    banner$.subscribe((res: any) => {
      this.bannerList = res.response_data;
    });
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // get's list of category. shows only 10 categories
  private getHomePageData(): void {
    const category$: Observable<Array<
      CategoryModel
    >> = this.myStoreService.getHomePageData();
    category$.subscribe((res: any) => {
      this.categoryList = res.response_data.categories;
      this.productsList = res.response_data.products;
      this.dealsList = res.response_data.topDeals;
      this.calculateDealAmount();
    });
  }

  // calculates deal amount
  private calculateDealAmount(): void {
    this.productsList.forEach((product) => {
      if (product.isDealAvailable) {
        product.variant.forEach((variant) => {
          variant.discountAmount =
            Number(variant.price) -
            Number(variant.price) * (product.dealPercent / 100);
        });
      }
    });
  }

  // navigate to product of category based on deal type
  public checkDealTypeAndNavigate(deal: DealsModel): void {
    if (deal.dealType === DealTypeEnum.PRODUCT) {
      this.router.navigate(['product-details/', deal.productId]);
    } else {
      this.router.navigate(['products/by/category/', deal.categoryId]);
    }
  }
}
