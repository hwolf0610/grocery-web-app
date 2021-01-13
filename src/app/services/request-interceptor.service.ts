import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { CrudService } from './crud.service';
import { catchError, map } from 'rxjs/operators';
import { HelperService } from "./helper.service";

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {

  constructor(private readonly crudService: CrudService, private helperService: HelperService) {
  }

  public intercept(request: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    let headers = {
      'Content-Type': 'application/json',
      'language': localStorage.getItem('language') || 'en',
      'req_from': 'webJson'
    }
    if (this.crudService.getAuthToken) {
      headers['Authorization'] = `Bearer ${this.crudService.getAuthToken}`;
    }
    const modifiedReq = request.clone({
      setHeaders: headers
    });
    return handler.handle(modifiedReq).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          if (event.body.response_code === 400 || event.body.response_code === 500 || event.body.response_code === 401) {
            if (!event.url.includes('favourites/check') && !event.url.includes('favourites/list') && !event.url.includes('orders/create')) {
              return this.helperService.errorToast(event.body.response_data, true);
            } else if (event.url.includes('orders/create')) {
              return event;
            }
          } else {
            return event;
          }
        }
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 404:
              error.error.errors.forEach(message => {
                this.helperService.errorToast(message, true);
              });
              return throwError(error);
            case 400:
              if (error.error.message) {
                this.helperService.errorToast(error.error.message, true);
              } else if (error.error.errors && error.error.errors.length > 0) {
                error.error.errors.forEach(message => {
                  this.helperService.errorToast(message, true);
                });
              }
              return throwError(error);
          }
        }
        return of(error);
      }));
  }
}
