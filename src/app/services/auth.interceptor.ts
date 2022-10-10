import { Injectable } from '@angular/core';
import StorageCrypter from 'storage-crypter';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  storageCrypter = new StorageCrypter('Secret');

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url !== "https://thibaultmorizet.fr/authentication_token" && request.url !== "https://thibaultmorizet.fr/ws/users") {            
      let jeton = this.storageCrypter.getItem('jeton', 'local');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${jeton}`,
        },
      });
    }
    return next.handle(request);
  }
}
