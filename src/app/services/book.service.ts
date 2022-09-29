import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../interfaces/book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private url: string = 'https://localhost:8000/ws/books';
  private urlWithoutLimit: string =
    'https://localhost:8000/ws/books?itemsPerPage=10000';
  private books: Array<object> = [];
  private formatsString: string = '';

  constructor(private http: HttpClient) {}

  getAllBooks() {
    return this.http.get<Array<Book>>(this.url);
  }
  getOneBook(id: number) {
    return this.http.get<Book>('https://localhost:8000/ws/books/' + id);
  }
  getAllBooksWithoutLimit(formats: Array<string>) {
    this.formatsString = '';
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });

    return this.http.get<Array<Book>>(
      this.urlWithoutLimit + this.formatsString
    );
  }
  getAllBooksForPage(page: number, formats: Array<string>) {
    this.formatsString = '';
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });
    return this.http.get<Array<Book>>(
      'https://localhost:8000/ws/books?page=' + page + this.formatsString
    );
  }

  getAllBooksByFormat(formats: Array<string>) {
    this.formatsString = '';
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });
    return this.http.get<Array<Book>>(
      'https://localhost:8000/ws/books?' + this.formatsString
    );
  }
}
