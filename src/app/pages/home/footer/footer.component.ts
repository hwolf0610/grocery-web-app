import { Component, OnInit } from '@angular/core';
import { HelperService } from "../../../services/helper.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public year: number = null;     // contains current year
  public storeName: string;


  constructor(private helperService: HelperService) {
    this.year = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.helperService.businessInfo$.subscribe(businessInfo => {
      if (businessInfo) {
        this.storeName = businessInfo.storeName;
      }
    })
  }

}
