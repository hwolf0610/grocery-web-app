import {Component, OnInit} from '@angular/core';
import {CategoryModel} from '../../models/category.model';
import {Observable} from 'rxjs';
import {HelperService} from "../../../services/helper.service";
import {environment} from "../../../../environments/environment";
import {CategoryService} from "./category.service";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public categoryList: Array<CategoryModel> = [];     // contains list of categories
  public categoryImageUrl: string = `${environment.IMAGEKIT_URL}tr:dpr-auto,tr:w-117`;      // contains optimized category image url
  constructor(private categoryService: CategoryService, private helperService: HelperService) {
    this.getCategories();
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
  }

  // get's list of category. shows only 10 categories
  private getCategories(): void {
    const category$: Observable<Array<CategoryModel>> = this.categoryService.getCategoryList();
    category$.subscribe((res: any) => {
      this.categoryList = res.response_data;
    });
  }

}
