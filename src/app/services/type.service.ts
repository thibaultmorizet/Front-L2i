import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Type } from '../interfaces/type';

@Injectable({
  providedIn: 'root',
})
export class TypeService {
  private url: string = 'https://thibaultmorizet.fr/ws/types';
  private types: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllTypes() {    
    return this.http.get<Array<Type>>(this.url);
  }
  updateType(id: number | undefined, type: Type) {
    return this.http.put<{ token: string }>(this.url + '/' + id, type);
  }

  createType(type: Type) {
    return this.http.post<Type>(this.url, type);
  }
  deleteTheType(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
