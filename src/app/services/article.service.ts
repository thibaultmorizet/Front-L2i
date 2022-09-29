import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Article } from '../interfaces/article';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private url: string = 'https://localhost:8000/ws/articles';
  private urlWithoutLimit: string =
    'https://localhost:8000/ws/articles?itemsPerPage=10000';
  private articles: Array<object> = [];
  private formatsString: string = '';

  constructor(private http: HttpClient) {}

  getAllArticles() {
    return this.http.get<Array<Article>>(this.url);
  }
  getAllArticlesWithoutLimit() {
    return this.http.get<Array<Article>>(this.urlWithoutLimit);
  }
  getAllArticlesForPage(page: number, formats: Array<string>) {
    this.formatsString = '';
    formats.forEach((el) => {
      this.formatsString += '&article_book_format.format_name[]=' + el;
    });
    return this.http.get<Array<Article>>(
      'https://localhost:8000/ws/articles?page=' + page + this.formatsString
    );
  }

  getAllArticlesByFormat(formats: Array<string>) {
    this.formatsString = '';
    formats.forEach((el) => {
      this.formatsString += '&article_book_format.format_name[]=' + el;
    });
    return this.http.get<Array<Article>>(
      'https://localhost:8000/ws/articles?' + this.formatsString
    );
  }
}
