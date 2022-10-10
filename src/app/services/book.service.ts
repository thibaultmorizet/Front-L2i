import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../interfaces/book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private url: string = 'https://thibaultmorizet.fr/ws/books';
  private urlWithoutLimit: string =
    'https://thibaultmorizet.fr/ws/books?itemsPerPage=10000';
  private books: Array<object> = [];
  private formatsString: string = '';
  private typesString: string = '';
  private searchString: string = '';

  constructor(private http: HttpClient) {}

  getAllBooks() {
    return this.http.get<Array<Book>>(this.url);
  }
  getOneBook(id: number) {
    return this.http.get<Book>('https://thibaultmorizet.fr/ws/books/' + id);
  }
  getAllBooksWithoutLimit(
    formats: Array<string>,
    types: Array<string>,
    search: string
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';

    if (search.length > 0) {
      this.searchString =
        '&book_title=' +
        search +
        '&book_author.author_firstname=' +
        search +
        '&book_author.author_lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&book_type.type_name[]=' + el;
    });
    return this.http.get<Array<Book>>(
      this.urlWithoutLimit +
        this.formatsString +
        this.typesString +
        this.searchString
    );
  }
  getAllBooksForPage(
    page: number,
    formats: Array<string>,
    types: Array<string>,
    search: string
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';

    if (search.length > 0) {
      this.searchString =
        '&book_title=' +
        search +
        '&book_author.author_firstname=' +
        search +
        '&book_author.author_lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&book_type.type_name[]=' + el;
    });
    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?page=' +
        page +
        this.formatsString +
        this.typesString +
        this.searchString
    );
  }

  getAllBooksByFormatAndTypeAndSearch(
    formats: Array<string>,
    types: Array<string>,
    search: string
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';

    if (search.length > 0) {
      this.searchString =
        '&book_title=' +
        search +
        '&book_author.author_firstname=' +
        search +
        '&book_author.author_lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&book_format.format_name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&book_type.type_name[]=' + el;
    });

    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?' +
        this.formatsString +
        this.typesString +
        this.searchString
    );
  }
}
