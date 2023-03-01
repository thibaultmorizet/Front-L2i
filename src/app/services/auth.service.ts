import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = 'https://thibaultmorizet.fr/authentication_token';
  constructor(private http: HttpClient) {}

  login(user: User) {
    return this.http.post<{ token: string }>(this.url, user);
  }

  getTheUser(email: String | undefined) {
    return this.http.get<Array<User>>(
      'https://thibaultmorizet.fr/ws/users?email=' + email
    );
  }
  sendNewPassword(mailInfo: object) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/mail',
      mailInfo
    );
  }
}
