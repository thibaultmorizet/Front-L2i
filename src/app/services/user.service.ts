import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'https://localhost:8000/ws/users';

  private user: User = {};

  constructor(private http: HttpClient) {}

  register(user: User) {
    console.log(user);
    
    return this.http.post<{ token: string }>(this.url,user);
  }

  
}
