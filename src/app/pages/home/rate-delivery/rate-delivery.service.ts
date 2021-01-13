import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class RateDeliveryService {

  constructor(private crud: CrudService) { }

  // // save delivery boy ratings
  public saveDeliveryData(ratedata): Observable<any> {
    return this.crud.saveData(`/delivery-boy-ratings/rate`, ratedata);
  }
}
