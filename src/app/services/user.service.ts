import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'https://thibaultmorizet.fr/ws/users';

  constructor(private http: HttpClient) {}

  register(user: User) {
    return this.http.post<{ token: string }>(this.url, user);
  }

  getTheUser(email: String | undefined) {
    return this.http.get<Array<User>>(
      'https://thibaultmorizet.fr/ws/users?email=' + email
    );
  }

  updateUser(id: number | undefined, user: User) {
    return this.http.put<{ token: string }>(this.url + '/' + id, user);
  }
  
  deleteTheUser(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
