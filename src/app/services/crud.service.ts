import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private authToken: string = null;     // contains user's authentication token
  constructor(private http: HttpClient) {
  }

  // get's user authentication token. used in request interceptor file
  public get getAuthToken(): string {
    return this.authToken;
  }

  // used to set user's authentication token
  public set setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  // sends request to fetch data from server
  public getData(url: string): Observable<any> {
    return this.http.get(environment.API_ENDPOINT + url);
  }

  // sends request to save/manipulate data
  public saveData(url: string, body: any): Observable<any> {
    return this.http.post(environment.API_ENDPOINT + url, body);
  }

  // sends request to manipulate data
  public updateData(url: string, body: any): Observable<any> {
    return this.http.put(environment.API_ENDPOINT + url, body);
  }

  // sends request to manipulate data
  public patchData(url: string, body: any): Observable<any> {
    return this.http.patch(environment.API_ENDPOINT + url, body);
  }

  // sends request to save/manipulate data
  public deleteData(url: string): Observable<any> {
    return this.http.delete(environment.API_ENDPOINT + url);
  } 
}
