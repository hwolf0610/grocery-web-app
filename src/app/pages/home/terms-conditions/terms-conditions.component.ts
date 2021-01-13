import { Component, OnInit } from '@angular/core';
import { TermsandConditionsModel } from "../../models/about-us.model";
import { HelperService } from "../../../services/helper.service";
import { MyStoreService } from "../my-store/my-store.service";

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {
  public pageData = {
    title: '',
    description: ''
  };      // contains information about the store

  constructor(private helperService: HelperService, private myStoreService: MyStoreService) {
    this.getTermsAndConditionInfo();
  }

  // get's terms and condition information
  public getTermsAndConditionInfo(): void {
    this.myStoreService.getTermsAndConditionInformation().subscribe((res: any) => {
      this.pageData = res.response_data;
    })
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

}
