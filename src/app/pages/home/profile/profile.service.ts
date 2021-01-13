import { Injectable } from "@angular/core";
import { CrudService } from "../../../services/crud.service";
import { Observable } from "rxjs";
import { Http, RequestOptions, Headers } from "@angular/http";
import { environment } from "../../../../environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private crud: CrudService, private http: Http) {
  }

  // get's user profile information
  public getUserProfileInformation(): Observable<any> {
    return this.crud.getData('/users/me');
  }

  // get's users chat history
  public getChatHistory(): Observable<any> {
    return this.crud.getData('/chats/list?page=0&limit=100000');
  }

  // updates user's profile information
  public updateUserProfile(profileInfo): Observable<any> {
    return this.crud.updateData('/users/update/profile', profileInfo);
  }

  // change password
  public changePassword(passwordData): Observable<any> {
    return this.crud.saveData('/users/change-password', passwordData);
  }

  // set's users default language
  public setDefaultLanguage(body): Observable<any> {
    return this.crud.updateData('/users/language/update', body);
  }

  // update users mobileNumber
  public updateMobileNumber(body): Observable<any> {
    return this.crud.updateData('/users/update/mobile-verify', body);
  }

  // verify otp 
  public otpVerify(otpVerify): Observable<any> {
    return this.crud.updateData('/users/update/mobile', otpVerify);
  }
  // uploads image
  public uploadImage(formData: FormData): Observable<any> {
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.crud.getAuthToken });
    let requestOptions = new RequestOptions({ headers: headers });
    return this.http.post(`${environment.API_ENDPOINT}/users/upload/image`, formData, requestOptions).pipe(map(res => res.json()));
  }
}
