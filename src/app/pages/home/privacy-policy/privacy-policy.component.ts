import { Component, OnInit } from '@angular/core';
import { HelperService } from "../../../services/helper.service";
import { PrivacyModel } from "../../models/about-us.model";
import { MyStoreService } from "../my-store/my-store.service";

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  public pageData = {
    title: '',
    description: ''
  };      // contains information about the store

  constructor(private helperService: HelperService, private myStoreService: MyStoreService) {
    this.getPrivacyPolicyInfo();
  }

  // get's privacy policy information
  public getPrivacyPolicyInfo(): void {
    this.myStoreService.getPrivacyPolicyInformation().subscribe((res: any) => {
      this.pageData = res.response_data;
    })
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

}
