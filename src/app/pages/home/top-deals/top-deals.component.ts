import { Component, OnInit } from '@angular/core';
import { DealsModel, DealTypeEnum } from "../../models/category.model";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { DealsService } from "./deals.service";

@Component({
  selector: 'app-top-deals',
  templateUrl: './top-deals.component.html',
  styleUrls: ['./top-deals.component.scss']
})
export class TopDealsComponent implements OnInit {
  public dealList: Array<DealsModel> = [];      // contains list of  deals
  public dealImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-181`;      // contains optimized product image url
  constructor(private dealsService: DealsService, private router: Router) {
    this.getTopDeals();
  }

  ngOnInit(): void {
  }

  // fetches list of all top deals
  public getTopDeals(): void {
    this.dealsService.getDealList().subscribe((res: any) => {
      this.dealList = res.response_data;
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
