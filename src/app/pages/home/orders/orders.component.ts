import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { interval, Observable } from 'rxjs';
import { OrderListModel, OrderModel, RateModel } from '../../models/order.model';
import { CartModel } from '../../models/cart.model';
import { HelperService } from '../../../services/helper.service';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { OrdersService } from "./orders.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  private readonly userId: string = null; // contains _id of logged in user
  public rateData: RateModel; // contains order rate information
  public orderList: Array<OrderModel> = []; // contains list of orders placed by users
  private modalRef: NgbModalRef; // contains modal reference
  public orderInfo: OrderListModel; // contains information about selected order
  public orderDetailsInfoId: string = '';  // contains information of orderId
  public currencyCode: string = null; // contains currency code
  public deliveryDate: string = null; // contains order delivery date
  public productImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-176`; // contains optimized product image url
  public productDetailImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-100`; // contains optimized product image url
  public isLoading: boolean = false;        // shows loader when true
  constructor(
    private modalService: NgbModal,
    private helperService: HelperService,
    private orderService: OrdersService,
    private router: Router,
  ) {
    this.helperService.currency$.subscribe((currencyCode) => {
      this.currencyCode = currencyCode;
    });
    this.userId = localStorage.getItem('id');
    this.getUserOrders();
  }

  // sends request to get all user orders
  private getUserOrders(): void {
    const orders$: Observable<any> = this.orderService.getOrderHistory();
    orders$.subscribe((res: any) => {
      this.orderList = res.response_code === 200 ? res.response_data : [];
    });
  }

  // opens order details modal
  public openOrderDetailsModal(content, orderDetails: OrderModel): void {
    this.orderService.getOrderDetails(orderDetails._id).subscribe((res: any) => {
      this.orderDetailsInfoId = orderDetails._id
      this.orderInfo = res.response_data.order;
      this.orderInfo.cart = res.response_data.cart;
      this.modalRef = this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        centered: true,
      });
      let cart = this.orderInfo.cart as CartModel;
      this.orderInfo.cart = cart;
    })

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

  // cancels the order
  public cancelOrder(): void {
    this.orderService.cancelOrder(this.orderInfo._id).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.modalService.dismissAll();
      this.getUserOrders();
    });
  }

  //rate delivery boy
  rateDeliveryBoy(orderId) {
    this.router.navigate(['/rate-delivery/' + orderId])
    this.modalService.dismissAll();

  }

  // open's product rate modal
  public openRateModal(ratecontent, productId: string): void {
    this.modalRef = this.modalService.open(ratecontent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      centered: true,
    });
    this.rateData = {
      description: '',
      productId,
      rate: 0,
    };
  }

  //clear the popup
  closeModal() {
    this.modalService.dismissAll();
    this.orderDetailsInfoId = '';
  }

  // sends request to rate product
  public rateProduct(): void {
    console.log(this.rateData);
    this.isLoading = true;
    this.orderService.rateproduct(this.rateData).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.closeRateModal();
    })
  }


  //// closes rate modal
  public closeRateModal() {
    this.modalRef.close();
    this.rateData = {
      description: '',
      rate: 0,
      productId: null,
    };
  }



  ngOnInit(): void {
    this.helperService.scrollTop();
    const getOrders = interval(10000);
    getOrders.subscribe((res => {
      if (this.orderDetailsInfoId != '') {
        this.orderService.getOrderDetails(this.orderDetailsInfoId).subscribe((res: any) => {
          this.orderInfo = res.response_data.order;
          this.orderInfo.cart = res.response_data.cart;
          let cart = this.orderInfo.cart as CartModel;
          this.orderInfo.cart = cart;
        })
      }
    }))

  }

}