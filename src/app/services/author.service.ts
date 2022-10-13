import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Author } from '../interfaces/author';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private url: string = 'https://thibaultmorizet.fr/ws/authors';
  private authors: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllAuthors() {
    return this.http.get<Array<Author>>(this.url);
  }}
