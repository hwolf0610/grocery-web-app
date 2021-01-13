import { Component, OnInit, TemplateRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductsModel, VariantModel } from '../../models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from '../../../services/helper.service';
import { CartState } from '../../store/cart.reducer';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { ActiveToast } from 'ngx-toastr';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CartModel } from '../../models/cart.model';
import { environment } from '../../../../environments/environment';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { RateModel } from '../../models/order.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  limitedOffers: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 500,
    autoplay: true,
    autoplaySpeed: 500,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 3,
      },
      740: {
        items: 2,
      },
      940: {
        items: 3,
      },
      1024: {
        items: 4,
      },
    },
    nav: true,
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
  private productId: string = null; // contains product id from route
  public selectedQuantity: number = 1; // contains selected quantity
  public selectedVariant: VariantModel; // contains selected variant
  public grandTotal: number; // contains grand total of variant and quantity
  public isLoggedIn: boolean = false;
  public relatedProducts: Array<ProductsModel> = []; // contains list of related products
  public currencyCode: string = null; // contains currency code
  private userId: string = null; // contains id of logged in user
  private cartInfo: CartModel; // contains cart information
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-800`; // contains optimized product image url
  public productCarouselImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-93`; // contains optimized product image url

  public productData: ProductsModel = {
    status: null,
    variant: [],
    title: '',
    description: null,
    category: null,
    isCategoryBasedOffer: null,
    imageUrl: null,
    _id: null,
    imageId: null,
    createdAt: null,
    updatedAt: null,
    user: null,
    type: null,
    averageRating: 0,
    noOfUsersRated: 0,
    totalRating: 0,
    isFavourite: false,
    isRated: false,
    categoryId: null,
    productImages: []
  };

  public rateData: RateModel = {
    productId: this.productId,
    rate: 0,
    description: ' ',
  };

  constructor(
    private route: ActivatedRoute,
    private helperService: HelperService,
    private store: Store<CartState>,
    private router: Router,
    private authService: AuthGuardService,
    private cartService: CartService,
    private productsService: ProductsService,
    private modalService: NgbModal
  ) {
    this.helperService.currency$.subscribe((currencyCode) => {
      this.currencyCode = currencyCode;
    });
    this.store.select('cartInfo').subscribe((state) => {
      if (state) {
        this.cartInfo = state;
      }
    });
    this.userId = localStorage.getItem('id');
    this.route.params.subscribe((params) => {
      this.productId = params.id;
      this.selectedQuantity = 1;
      this.getProductDetails();
      this.getRelatedProducts();
      this.isLoggedIn = this.userId ? true : false;
    });
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // get's related products
  private getRelatedProducts(): void {
    const products$ = this.productsService.getRelatedProducts();
    products$.subscribe((res: any) => {
      let productsId = [{ _id: this.productId }];
      let products: Array<any> = _.differenceBy(
        res.response_data,
        productsId,
        '_id'
      );
      if (products.length > 0) {
        this.relatedProducts = products.slice(0, 11);
      }
    });
  }

  // open's product rate modal
  public openRateModal(rateContent: TemplateRef<any>): void {
    this.modalService.open(rateContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      centered: true,
    });
  }

  // sends request to rate product
  public rateProduct(): void {
    this.productsService
      .saveProductRating(this.rateData)
      .subscribe((res: any) => {
        this.helperService.successToast(res.response_data, true);
        this.closeRateModal();
        this.getProductDetails();
      });
  }

  // closes rate modal
  public closeRateModal() {
    this.modalService.dismissAll();
  }

  // get's product details
  private getProductDetails(): void {
    this.productsService
      .getProductDetails(this.productId)
      .subscribe((res: any) => {
        this.productData = res.response_data;
        if (this.productData.isDealAvailable) {
          this.productData.variant.forEach((variant) => {
            variant.discountAmount =
              Number(variant.price) -
              Number(variant.price) * (this.productData.dealPercent / 100);
          });
        }
        if (this.productData.isAddedToCart) {
          this.selectedQuantity = this.productData.quantityToCart;
        }
        this.selectedVariant =
          this.productData.variant[0].productStock > 0
            ? this.productData.variant[0]
            : undefined;
        this.calculateGrandTotal();
      });
  }

  // sets selected variant
  public setSelectedVariant(
    checked: boolean,
    variant: VariantModel
  ): void | ActiveToast<any> {
    if (checked && variant.productStock === 0) {
      return this.helperService.infoToast('PRODUCT_OUT_STOCK');
    }
    this.selectedVariant = checked ? variant : undefined;
    this.calculateGrandTotal();
  }

  // calculates grand total
  public calculateGrandTotal(): void {
    if (this.selectedVariant) {
      this.grandTotal = this.productData.isDealAvailable
        ? Number(this.selectedVariant.discountAmount) * this.selectedQuantity
        : Number(this.selectedVariant.price) * this.selectedQuantity;
    }
  }

  // increases/decreases quantity
  public changeQuantity(type: string): void {
    switch (type) {
      case 'increment':
        this.selectedQuantity += 1;
        this.calculateGrandTotal();
        break;
      case 'decrement':
        if (this.selectedQuantity > 1) {
          this.selectedQuantity -= 1;
          this.calculateGrandTotal();
        }
        break;
    }
  }

  // add's product to favourite
  public addToFavourite() {
    this.productsService.addToWishList(this.productId).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.productData.isFavourite = true;
    });
  }

  // removes product from favourite
  public removeFromFavourite() {
    this.productsService
      .removeProductFromWishList(this.productId)
      .subscribe((res: any) => {
        this.helperService.successToast(res.response_data, true);
        this.productData.isFavourite = false;
      });
  }

  // sends request to add item to cart
  public addToCart() {
    if (this.isLoggedIn === true) {
      if (this.cartInfo && this.cartInfo.products.length > 0) {
        const data = this.cartInfo.products.find(
          (cart) => cart.productId === this.productId
        );
        if (data && data.unit !== this.selectedVariant.unit) {
          this.cartService
            .deleteProductFromCart(this.productId)
            .subscribe((res: any) => {
              this.cartService.prepareCartData(
                this.productData,
                this.selectedVariant,
                this.selectedQuantity
              );
            });
        } else {
          this.cartService.prepareCartData(
            this.productData,
            this.selectedVariant,
            this.selectedQuantity
          );
        }
      } else {
        this.cartService.prepareCartData(
          this.productData,
          this.selectedVariant,
          this.selectedQuantity
        );
      }
    } else {
      this.helperService.infoToast('AUTH_REQ');
      this.router.navigate(['login'], {
        queryParams: { redirectTo: `product-details/${this.productId}` },
      });
    }
  }
}
