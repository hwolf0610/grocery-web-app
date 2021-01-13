import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { Observable } from "rxjs";
import { RateModel } from "../../models/order.model";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private crud: CrudService) {
  }

  // get's all products
  public getAllProducts(page: number): Observable<any> {
    return this.crud.getData(`/products/list?limit=10&page=${page}`);
  }

  // searches product with product name
  public searchProduct(page, input: string): Observable<any> {
    return this.crud.getData(`/products/search?q=${input}&page=${page}&limit=10`)
  }

  // get's product by category
  public getProductByCategory(categoryId: string, page: number): Observable<any> {
    return this.crud.getData(`/products/category/${categoryId}?page=${page}&limit=10`)
  }

  // get's product by sub-category
  public getProductBySubCategory(subCategoryId: string, page: number): Observable<any> {
    return this.crud.getData(`/products/sub-category/${subCategoryId}?page=${page}&limit=10`);
  }

  // get's products details
  public getProductDetails(productId: string): Observable<any> {
    return this.crud.getData(`/products/detail/${productId}`)
  }

  // get's related products
  public getRelatedProducts(): Observable<any> {
    return this.crud.getData('/products/related')
  }

  // get's users wishlist
  public getWishList(): Observable<any> {
    return this.crud.getData(`/favourites/list`);
  }

  // adds' product to wishlist
  public addToWishList(productId: string): Observable<any> {
    return this.crud.saveData(`/favourites/add/${productId}`, undefined);
  }

  // removes product from wishlist
  public removeProductFromWishList(productId: string): Observable<any> {
    return this.crud.deleteData(`/favourites/remove/${productId}`);
  }

  // saves product rating
  public saveProductRating(ratingData: RateModel): Observable<any> {
    return this.crud.saveData('/ratings/rate', ratingData);
  }
}
