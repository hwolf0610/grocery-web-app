import { TranslateLoader } from "@ngx-translate/core";
import { CrudService } from "./crud.service";
import { Observable } from "rxjs";
import { HelperService } from "./helper.service";
import { map } from "rxjs/operators";

export class CustomLoader implements TranslateLoader {
  constructor(private crud: CrudService, private helperService: HelperService) {
  }

  // get's translated JSON from the server based on selected language
  public getTranslation(lang: string): Observable<any> {
    const language$ = this.crud.getData(`/languages/web?code=${lang}`).pipe(map((res: any) => res.response_data[lang]));
    this.helperService.setLanguageJSON(language$);
    return language$;
  }
}
