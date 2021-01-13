import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { walletHistoryModel, walletModel } from '../../models/auth.model';
import { WalletPaginationType } from '../../models/order.model';
import { ProfileService } from '../profile/profile.service';
import { WalletService } from './wallet.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  public currencyCode: string = null; // contains currency code
  public limit: number = 5;      // shows 10 records per page
  public page: number = 0;     // contains current page number
  public total: number = 0;   // contains total number of records
  public walletHistoryDetails: Array<walletHistoryModel> = [];      // contains wallet transaction history
  public walletInfo: walletModel = {
    walletAmount: null,
  };      // contains customers wallet information
  public fetchedRecordsCount: number = 0;      // contains fetched records count


  constructor(private profileService: ProfileService, private walletService: WalletService, private helperService: HelperService) {
    this.getUserProfileInfo();
    this.getWalletHistory();
    {
      this.helperService.currency$.subscribe((currencyCode) => {
        this.currencyCode = currencyCode;
      });
    }
  }

  ngOnInit(): void {
  }

  // contains user's profile information
  private getUserProfileInfo(): void {
    this.profileService.getUserProfileInformation().subscribe((res: any) => {
      this.walletInfo.walletAmount = res.response_data.walletAmount ? res.response_data.walletAmount : 0;
    });
  }

  //contains order history information
  private getWalletHistory(type?: string): void {
    this.walletService.getWalletHistory(this.limit, this.page).subscribe((res: any) => {
      this.walletHistoryDetails = res.response_data || [];
      this.total = res.total;
      if (!type) {
        this.fetchedRecordsCount = this.walletHistoryDetails.length;
      } else {
        switch (type) {
          case WalletPaginationType.INC:
            this.fetchedRecordsCount += this.walletHistoryDetails.length;
            break;
        }
      }
      console.log("RECORDS FETCHED", this.fetchedRecordsCount);
    })
  }

  // Pagination
  public pageChange(type: string): void {
    switch (type) {
      case WalletPaginationType.INC:
        this.page += 1;
        this.getWalletHistory(type);
        break;
      case WalletPaginationType.DEC:
        this.page -= 1;
        this.fetchedRecordsCount -= this.walletHistoryDetails.length;
        this.getWalletHistory(type);
        break;
    }
  }
}
