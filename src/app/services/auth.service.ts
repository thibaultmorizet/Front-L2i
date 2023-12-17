import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = 'https://l2i.thibaultmorizet.fr/authentication_token';
  constructor(private http: HttpClient) {}

  login(user: User) {
    return this.http.post<{ token: string }>(this.url, user);
  }

  sendNewPassword(mailInfo: object) {
    return this.http.post<{ token: string }>(
      'https://l2i.thibaultmorizet.fr/mail',
      mailInfo
    );
  }
}
