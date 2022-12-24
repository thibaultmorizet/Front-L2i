import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../interfaces/category';

@Injectable({
  providedIn: 'root',
})
export class Categoryservice {
  private url: string = 'https://thibaultmorizet.fr/ws/categories';
  private categories: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllCategories() {    
    return this.http.get<Array<Category>>(this.url);
  }
  updateCategory(id: number | undefined, category: Category) {
    return this.http.put<{ token: string }>(this.url + '/' + id, category);
  }

  createCategory(category: Category) {
    return this.http.post<Category>(this.url, category);
  }
  deleteTheCategory(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
