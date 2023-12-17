import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Author } from '../interfaces/author';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private url: string = 'https://l2i.thibaultmorizet.fr/ws/authors';
  private authors: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllAuthors() {
    return this.http.get<Array<Author>>(this.url);
  }

  updateAuthor(id: number | undefined, author: Author) {
    return this.http.put<{ token: string }>(this.url + '/' + id, author);
  }

  createAuthor(author: Author) {
    return this.http.post<Author>(this.url, author);
  }

  deleteTheAuthor(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
