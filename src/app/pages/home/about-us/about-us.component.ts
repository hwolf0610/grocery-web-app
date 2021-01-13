import { Component, OnInit } from '@angular/core';
import { HelperService } from "../../../services/helper.service";
import { MyStoreService } from "../my-store/my-store.service";
import { BusinessInfoModel } from "../../models/about-us.model";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  public pageData = {
    title: '',
    description: ''
  };      // contains information about the store
  public businessInfoList: BusinessInfoModel;

  constructor(private helperService: HelperService, private myStoreService: MyStoreService) {
    this.getAboutUsInfo();
  }

  // get's about us information
  public getAboutUsInfo(): void {
    this.myStoreService.getAboutInformation().subscribe((res: any) => {
      this.pageData = res.response_data;
    })
  }

  ngOnInit(): void {
    this.helperService.businessInfo$.subscribe(businessInfo => {
      if (businessInfo) {
        this.businessInfoList = businessInfo;
      }
    })
    this.helperService.scrollTop();
  }

}
