import {Injectable} from "@angular/core";
import {CrudService} from "../../../services/crud.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private crud: CrudService) {
  }

  // get's category list
  public getCategoryList(): Observable<any> {
    return this.crud.getData(`/categories/list`)
  }
}
