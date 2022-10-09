import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'https://localhost:8000/ws/users';

  constructor(private http: HttpClient) {}

  register(user: User) {    
    return this.http.post<{ token: string }>(this.url,user);
  }

  getTheUser(email: String|undefined){    
    return this.http.get<Array<User>>("https://localhost:8000/ws/users?email="+email);
  }
}
