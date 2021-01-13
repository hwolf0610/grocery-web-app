import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { Deliveryboy, OrderListModel, OrderModel, RateModel, RateModelDeliveryBoy } from '../../models/order.model';
import { OrdersService } from '../orders/orders.service';
import { RateDeliveryService } from './rate-delivery.service';

@Component({
  selector: 'app-rate-delivery',
  templateUrl: './rate-delivery.component.html',
  styleUrls: ['./rate-delivery.component.scss']
})
export class RateDeliveryComponent implements OnInit {
  public rateData: RateModelDeliveryBoy = {
    rate: 0,
    description: '',
    orderId: '',
    deliveryBoyId: '',
  }; // contains order rate information
  public orderId: string;
  public orderInfo: Deliveryboy = {
    assignedToName: '',
    assignedToId: ''
  }; // contains information about selected order
  constructor(private orderService: OrdersService, private router: Router, private activatedRoute: ActivatedRoute, private ratedeliveryService: RateDeliveryService, private helperService: HelperService) {
    this.activatedRoute.params.subscribe(params => {
      this.orderId = params['id'];
      this.getOrderDetails();
    })
  }


  ngOnInit(): void {
  }

  // order details list
  public getOrderDetails(): void {
    this.orderService.getOrderDetails(this.orderId).subscribe((res: any) => {
      this.orderInfo.assignedToName = res.response_data.order.assignedToName;
      this.orderInfo.assignedToId = res.response_data.order.assignedToId;
    })

  }
  //rate delivery boy
  rateDelivaryBoy() {
    this.rateData.orderId = this.orderId;
    this.rateData.deliveryBoyId = this.orderInfo.assignedToId;
    this.ratedeliveryService.saveDeliveryData(this.rateData).subscribe((res: any) => {
      this.helperService.successToast(res.response_data, true);
      this.router.navigate(['/orders'])
    })
  }
}
