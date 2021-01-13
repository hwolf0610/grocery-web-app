import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ProductsModel, SubCategoryModel, VariantModel } from '../../models/category.model';
import { HelperService } from '../../../services/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from "@ngrx/store";
import { CartState } from "../../store/cart.reducer";
import { environment } from "../../../../environments/environment";
import { ProductsService } from "./products.service";
import { CartService } from "../cart/cart.service";
import * as _ from 'lodash';

declare let $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  closeResult = '';
  public productsList: Array<ProductsModel> = [];     // contains list of products
  public selectedProduct: ProductsModel;      // contains selected product information
  public selectedVariant: VariantModel;   // contains variant information
  public categoryId: string = null;      // contains category id from route
  public currencyCode: string = null;     // contains currency code
  public isLoading: boolean = false;        // shows loader when true
  public selectedQuantity: number = 1;      // contains selected quantity
  public subCategories: Array<SubCategoryModel> = [];     // contains list of sub-categories
  private subCategoryId: string = null;     // contains selected subcategory id
  private userId: string = null;      // contains id of logged in user
  private productIndex: number = 0;     // contains product index
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-173`;      // contains optimized product image url
  public subCatFilterApplied: boolean = false;      // set to true when sub-category response is saved

  constructor(private modalService: NgbModal, private helperService: HelperService, private route: ActivatedRoute, private store: Store<CartState>, private router: Router, private productsService: ProductsService, private cartService: CartService) {
    this.store.select('cartInfo').subscribe(state => {
      if (state && state.products.length > 0) {
        state.products.forEach(cart => {
          const index = this.productsList.findIndex(product => product._id === cart.productId);
          if (index !== -1) {
            this.productsList[index].isAddedToCart = true;
            this.productsList[index].quantityToCart = cart.quantity;
            this.productsList[index].cartId = state._id;
            this.productsList[index].unitInCart = cart.unit;
          }
        });
      }
    });
    this.helperService.currency$.subscribe(currencyCode => {
      this.currencyCode = currencyCode;
    });
    this.route.params.subscribe(params => {
      this.categoryId = params.id ? params.id : null;
      if (this.categoryId) {
        this.productIndex = 0;
        this.subCatFilterApplied = false;
      }
    });
    this.userId = localStorage.getItem('id');
    this.getProductList();
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // opens add to cart modal
  public openAddToCartModal(content: TemplateRef<any>, product: ProductsModel): void {
    if (localStorage.getItem('token') && localStorage.getItem('id')) {
      this.selectedProduct = product;
      this.selectedProduct.variant.forEach(variant => {
        variant.quantity = 1;
      });
      this.selectedQuantity = 1;
      this.selectedVariant = product.variant.length === 1 ? product.variant[0] : undefined;
      if (this.selectedProduct.variant.length > 1) {
        this.modalService
          .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
          .result.then(
            result => {
              this.closeResult = `Closed with: ${result}`;
            },
            reason => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
      } else {
        this.addToCart();
      }
    } else {
      this.helperService.infoToast("AUTH_REQ");
      this.router.navigate(['login'], { queryParams: { redirectTo: this.router.url } })
    }
  }

  // closes add to cart modal
  public closeAddToCartModal(): void {
    this.modalService.dismissAll();
    this.selectedProduct = undefined;
    this.selectedVariant = undefined;
    this.selectedQuantity = 1;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  // checks cart state
  private checkCartState(): void {
    this.store.select('cartInfo').subscribe(state => {
      if (state && state.products.length > 0) {
        state.products.forEach(cart => {
          const index = this.productsList.findIndex(product => product._id === cart.productId);
          if (index !== -1) {
            this.productsList[index].isAddedToCart = true;
            this.productsList[index].quantityToCart = cart.quantity;
            this.productsList[index].cartId = state._id;
          }
        });
      }
    });
  }

  // called when tab is changed
  public tabChangeEvent(event): void {
    this.productIndex = 0;
    if (event.nextId === 'All') {
      this.subCategoryId = null;
      this.subCatFilterApplied = false;
      this.productsList = [];
      this.getProductList();
    } else {
      this.subCategoryId = event.nextId;
      this.productsList = [];
      this.getProductBySubCategory();
    }
  }

  // get's products list. shows only 10 products
  private getProductList(): void {
    this.isLoading = true;
    let product$: Observable<Array<ProductsModel>> = this.categoryId ? this.productsService.getProductByCategory(this.categoryId, this.productIndex) : this.productsService.getAllProducts(this.productIndex);
    product$.subscribe((res: any) => {
      this.isLoading = false;
      if (this.productsList.length === 0) {
        this.productsList = Array.isArray(res.response_data) ? res.response_data : res.response_data.products;
      } else {
        const newProducts = res.response_data.products && Array.isArray(res.response_data.products) ? res.response_data.products : Array.isArray(res.response_data) ? res.response_data : [];
        if (newProducts.length > 0) {
          this.productsList = this.productsList.concat(newProducts);
        }
      }
      this.productsList = _.uniqBy(this.productsList, '_id');
      this.calculateDealAmount();
      if (this.categoryId) {
        this.subCategories = res.response_data.subCategories;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  // fetches product by sub-category
  private getProductBySubCategory(): void {
    if (!this.subCatFilterApplied) {
      this.productsList = [];
    }
    const products$ = this.productsService.getProductBySubCategory(this.subCategoryId, this.productIndex);
    products$.subscribe((res: any) => {
      this.isLoading = false;
      if (Array.isArray(res.response_data) && res.response_data.length > 0) {
        this.subCatFilterApplied = true;
        this.productsList = this.productsList.concat(res.response_data);
        this.productsList = _.uniqBy(this.productsList, '_id');
        this.calculateDealAmount();
        this.checkCartState();
      }
    });
  }


  // calculates deal amount
  private calculateDealAmount(): void {
    this.productsList.forEach(product => {
      if (product.isDealAvailable) {
        product.variant.forEach(variant => {
          variant.discountAmount = Number(variant.price) - (Number(variant.price) * (product.dealPercent / 100));
        });
      }
    });
  }

  // called when window is scrolled down
  public windowScrolledDown(): void {
    this.productIndex += 1;
    if (!this.subCategoryId) {
      this.getProductList();
    } else {
      this.getProductBySubCategory();
    }
  }

  // called when window is scrolled up
  public windowScrolledUp(): void {
    // this.productIndex += 10;
    this.getProductList();
  }

  // increments/decrements quantity
  public changeQuantity(type: string, product: ProductsModel): void {
    if (type === 'increment') {
      let quantity = product.quantityToCart;
      quantity += 1;
      // this.store.dispatch(new CartActions.UpdateCartAction({cartId: product.cartId, productId: product._id, quantity}));
      this.updateCartData(product, quantity);
    } else {
      if (product.quantityToCart > 1) {
        let quantity = product.quantityToCart;
        quantity -= 1;
        this.updateCartData(product, quantity);
      } else {
        this.cartService.deleteProductFromCart(product._id).subscribe((res: any) => {
          product.isAddedToCart = false;
          product.quantityToCart = undefined;
          product.cartId = undefined;
          product.unitInCart = undefined;
          this.cartService.checkCartFormat(res, 'delete');
        });
      }
    }
  }

  // updates cart data
  private updateCartData(product, quantity) {
    this.cartService.updateCart({
      cartId: product.cartId, productId: product._id, quantity, unit: product.variant[0].unit
    }).subscribe((res: any) => {
      this.cartService.checkCartFormat(res, 'update');
    });
  }

  // this event is called when a variant is selected
  public variantSelectionEvent(event, variant: VariantModel): void {
    this.selectedVariant = event.target.checked ? variant : undefined;
    this.selectedQuantity = 1;
  }

  // increment quantity
  public incrementQuantity(): void {
    this.selectedQuantity += 1
  }

  // decrement quantity
  public decrementQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity -= 1;
    }
  }


  // sends request to add to cart
  public addToCart(): void {
    this.cartService.prepareCartData(this.selectedProduct, this.selectedVariant, this.selectedQuantity);
    this.closeAddToCartModal();
  }
}
