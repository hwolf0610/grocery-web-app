import { Component, OnInit, TemplateRef } from '@angular/core';
import { FavouritesModel, ProductsModel, VariantModel } from '../../models/category.model';
import { HelperService } from "../../../services/helper.service";
import { Store } from "@ngrx/store";
import { CartState } from "../../store/cart.reducer";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../../environments/environment";
import { CartService } from "../cart/cart.service";
import { ProductsService } from "../products/products.service";

@Component({
  selector: 'app-saved-items',
  templateUrl: './saved-items.component.html',
  styleUrls: ['./saved-items.component.scss']
})
export class SavedItemsComponent implements OnInit {
  public closeResult = '';
  public favourites: Array<ProductsModel> = [];     // contains list of products added by user
  public currencyCode: string = null;     // contains currency code
  public selectedProduct: ProductsModel;      // contains selected product information
  public selectedVariant: VariantModel;   // contains variant information
  public selectedQuantity: number = 1;      // contains selected quantity
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-168`;      // contains optimized product image url
  constructor(private productsService: ProductsService, private helperService: HelperService, private store: Store<CartState>, private modalService: NgbModal, private cartService: CartService) {
    this.helperService.currency$.subscribe(currencyCode => {
      this.currencyCode = currencyCode;
    });
    this.store.select('cartInfo').subscribe(state => {
      if (state && state.products.length > 0) {
        this.checkCartState();
      }
    });
    this.getUserFavourites();
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // get's all user favourites
  private getUserFavourites(): void {
    const favourites$ = this.productsService.getWishList();
    favourites$.subscribe((res: any) => {
      this.favourites = res.response_data;
      this.calculateDealAmount();
      this.checkCartState();
    });
  }

  // calculates deal amount
  private calculateDealAmount(): void {
    this.favourites.forEach(favourite => {
      if (favourite.isDealAvailable) {
        favourite.variant.forEach(variant => {
          variant.discountAmount = Number(variant.price) - (Number(variant.price) * (favourite.dealPercent / 100));
        });
      }
    });
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
          .open(content, {ariaLabelledBy: 'modal-basic-title', centered: true})
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

  // checks cart state
  private checkCartState(): void {
    this.store.select('cartInfo').subscribe(state => {
      if (state && state.products.length > 0) {
        state.products.forEach(cart => {
          const index = this.favourites.findIndex(favourite => favourite._id === cart.productId);
          if (index !== -1) {
            this.favourites[index].isAddedToCart = true;
            this.favourites[index].quantityToCart = cart.quantity;
            this.favourites[index].cartId = state._id;
            let variantData = this.favourites[index].variant.find(variant => variant.unit === cart.unit);
            if (variantData) {
              this.favourites[index].variant.unshift(variantData);
            }
          }
        });
      }
    });
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
