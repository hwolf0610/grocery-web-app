import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private crud: CrudService) { }

  // // getting  wallet history
  public getWalletHistory(limit, index): Observable<any> {
    return this.crud.getData(`/wallets/history?limit=${limit}&page=${index}`);
  }
}

