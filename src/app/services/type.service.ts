import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Type } from '../interfaces/type';

@Injectable({
  providedIn: 'root',
})
export class TypeService {
  private url: string = 'https://localhost:8000/ws/types';
  private types: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllTypes() {    
    return this.http.get<Array<Type>>(this.url);
  }
}
