import { Component, OnInit, TemplateRef } from '@angular/core';
import { Store } from "@ngrx/store";
import { CartState } from "../../store/cart.reducer";
import { ProductsModel, VariantModel } from "../../models/category.model";
import { HelperService } from "../../../services/helper.service";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../../environments/environment";
import { CartService } from "../cart/cart.service";
import { ProductsService } from "../products/products.service";
import * as _ from 'lodash';


@Component({
  selector: 'app-show-result',
  templateUrl: './show-result.component.html',
  styleUrls: ['./show-result.component.scss'],
})
export class ShowResultComponent implements OnInit {
  closeResult = '';
  public searchInput: string = '';      // contains product name to search
  public productsList: Array<ProductsModel> = [];     // contains list of products
  private userId: string = null;      // contains id of logged in user
  public currencyCode: string = null;     // contains currency code
  public selectedProduct: ProductsModel;      // contains selected product information
  public selectedVariant: VariantModel;   // contains variant information
  public selectedQuantity: number = 1;      // contains selected quantity
  public isLoading: boolean = false;        // shows loader when true
  private productIndex: number = 0;     // contains product index
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-168`;      // contains optimized product image url

  constructor(private store: Store<CartState>, private helperService: HelperService, private modalService: NgbModal, private cartService: CartService, private productsService: ProductsService) {
    this.userId = localStorage.getItem('id');
    this.store.select('cartInfo').subscribe(state => {
      if (state && state.products.length > 0) {
        this.checkCartState();
      }
    });
    this.helperService.currency$.subscribe(currencyCode => {
      this.currencyCode = currencyCode;
    });
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
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
            let variantData = this.productsList[index].variant.find(variant => variant.unit === cart.unit);
            if (variantData) {
              this.productsList[index].variant.unshift(variantData);
            }
          }
        });
      }
    });
  }

  // searches product by name,desc
  public searchProduct(): void {
    if (this.searchInput.length === 0) {
      this.clearSearch();
    } else {
      if (this.searchInput.length <= 2) {
        return;
      }
      this.isLoading = true;
      this.productIndex = 0;
      this.productsList = [];
      const products$ = this.productsService.searchProduct(this.productIndex, this.searchInput);
      products$.subscribe((res: any) => {
        this.isLoading = false;
        // if (this.productsList.length === 0) {
          this.productsList = res.response_data;
        // } else {
        //   const newProducts = res.response_data.products && Array.isArray(res.response_data.products) ? res.response_data.products : Array.isArray(res.response_data) ? res.response_data : [];
        //   if (newProducts.length > 0) {
        //     this.productsList = this.productsList.concat(newProducts);
        //   }
        // }
        // this.productsList = res.response_data;
        this.checkCartState();
        this.calculateDealAmount();
      }, error => {
        this.isLoading = false;
      });
    }
  }

  //window scrolled down
  public windowScrolledDown(): void {
    this.productIndex += 1;
    const products$ = this.productsService.searchProduct(this.productIndex, this.searchInput);
    products$.subscribe((res: any) => {
      this.isLoading = false;
      if (this.productsList.length === 0) {
        this.productsList = Array.isArray(res.response_data) ? res.response_data : res.response_data.products;
      } else {
        const newProducts = res.response_data.products && Array.isArray(res.response_data.products) ? res.response_data.products : Array.isArray(res.response_data) ? res.response_data : [];
        if (newProducts.length > 0) {
          this.productsList = this.productsList.concat(newProducts);
        }
      }
      // this.productsList = res.response_data;
      this.checkCartState();
      this.calculateDealAmount();
    }, error => {
      this.isLoading = false;
    });
  }


  // called when window is scrolled up
  public windowScrolledUp(): void {
    // this.productIndex += 10;
    this.searchProduct();
  }

  // clears search and resets products
  public clearSearch(): void {
    this.searchInput = '';
    this.productsList = [];
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
      cartId: product.cartId,
      productId: product._id,
      quantity,
      unit: product.variant[0].unit
    }).subscribe((res: any) => {
      this.cartService.checkCartFormat(res, 'update');
    });
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
            }
          );
      } else {
        this.addToCart();
      }
    } else {
      this.helperService.infoToast("AUTH_REQ");
    }
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

  // sends request to add to cart
  public addToCart(): void {
    this.cartService.prepareCartData(this.selectedProduct, this.selectedVariant, this.selectedQuantity);
    this.closeAddToCartModal();
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

  // closes add to cart modal
  public closeAddToCartModal(): void {
    this.modalService.dismissAll();
    this.selectedProduct = undefined;
    this.selectedVariant = undefined;
    this.selectedQuantity = 1;
  }

}
