import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'https://back-l2i.thibaultmorizet.fr/ws/users';

  constructor(private http: HttpClient) {}

  register(user: User) {
    return this.http.post<{ token: string }>(this.url, user);
  }
  getTheUser(email: string | undefined) {
    return this.http.get<Array<User>>(
      'https://back-l2i.thibaultmorizet.fr/ws/users?email=' + email
    );
  }
  updateUser(id: number | undefined, user: User) {
    return this.http.put<{ token: string }>(this.url + '/' + id, user);
  }
  deleteTheUser(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
  getAllUsers() {
    return this.http.get<Array<User>>(this.url);
  }

  getAllAdminsUsers() {
    return new Promise((resolve) => {
      this.http
        .get<Array<User>>(this.url + '?itemsPerPage=10000')
        .pipe()
        .subscribe((data: any) => {
          let users: Array<User> = [];
          data.forEach((anUser: any) => {
            if (anUser.roles?.includes('ROLE_ADMIN')) {
              users.push(anUser);
            }
          });
          resolve(users);
        });
    });
  }
  getAllModeratorsUsers() {
    return new Promise((resolve) => {
      this.http
        .get<Array<User>>(this.url + '?itemsPerPage=10000')
        .pipe()
        .subscribe((data: any) => {
          let users: Array<User> = [];
          data.forEach((anUser: any) => {
            if (anUser.roles?.includes('ROLE_MODERATOR')) {
              users.push(anUser);
            }
          });
          resolve(users);
        });
    });
  }
  getAllNotAdminsAndNotModeratorsUsers() {
    return new Promise((resolve) => {
      this.http
        .get<Array<User>>(this.url + '?itemsPerPage=10000')
        .pipe()
        .subscribe((data: any) => {
          let users: Array<User> = [];
          data.forEach((anUser: any) => {
            if (
              !anUser.roles?.includes('ROLE_ADMIN') &&
              !anUser.roles?.includes('ROLE_MODERATOR')
            ) {
              users.push(anUser);
            }
          });
          resolve(users);
        });
    });
  }
}
