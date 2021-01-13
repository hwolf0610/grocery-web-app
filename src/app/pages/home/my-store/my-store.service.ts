import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MyStoreService {
  constructor(private crud: CrudService) {
  }

  // get's banner list
  public getBannerList(): Observable<any> {
    return this.crud.getData(`/banners/list`);
  }

  // get's home page data
  public getHomePageData(): Observable<any> {
    return this.crud.getData(`/products/home?limit=10&page=0`);
  }

  // get's about us information
  public getAboutInformation():Observable<any>{
    return this.crud.getData('/pages/about-us')
  }

  // get's privacy policy information
  public getPrivacyPolicyInformation():Observable<any>{
    return this.crud.getData('/pages/privacy-policy')
  }

  // get's terms and condition information
  public getTermsAndConditionInformation():Observable<any>{
    return this.crud.getData('/pages/terms-and-conditions')
  }
}
