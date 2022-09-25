import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Article } from '../interfaces/article';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private url: string = 'http://localhost:8000/ws/articles';
  private articles: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllArticles() {
    return this.http.get<Array<Article>>(this.url);
  }
}
