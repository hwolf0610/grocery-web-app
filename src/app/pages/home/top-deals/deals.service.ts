import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DealsService {
  constructor(private crud: CrudService) {
  }

  // get's deals list
  public getDealList(): Observable<any> {
    return this.crud.getData(`/deals/top`);
  }
}
