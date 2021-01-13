import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { Observable } from "rxjs";
import { RateModel } from "../../models/order.model";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private crud: CrudService) {
  }

  // get's users orders
  public getOrderHistory(): Observable<any> {
    return this.crud.getData(`/orders/list?page=0&limit=100000`);
  }

  // get's order details
  public getOrderDetails(orderId: string): Observable<any> {
    return this.crud.getData(`/orders/detail/${orderId}`);
  }

  // sends request to cancel the order
  public cancelOrder(orderId: string): Observable<any> {
    return this.crud.updateData(`/orders/cancel/${orderId}`, undefined);
  }

  // places new order
  public placeOrder(orderData): Observable<any> {
    return this.crud.saveData('/orders/create', orderData);
  }

  //rate product
  public rateproduct(rateData): Observable<any> {
    return this.crud.saveData('/ratings/rate', rateData);
  }
}
