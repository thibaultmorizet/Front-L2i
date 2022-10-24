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
        '&title=' +
        search +
        '&author.firstname=' +
        search +
        '&author.lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&format.name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el;
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
        '&title=' +
        search +
        '&author.firstname=' +
        search +
        '&author.lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&format.name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el;
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
        '&title=' +
        search +
        '&author.firstname=' +
        search +
        '&author.lastname=' +
        search;
    }
    formats.forEach((el) => {
      this.formatsString += '&format.name[]=' + el;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el;
    });

    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?' +
        this.formatsString +
        this.typesString +
        this.searchString
    );
  }

  updateBook(id: number | undefined, book: Book) {
    return this.http.put<{ token: string }>(this.url + '/' + id, book);
  }

  createBook(book: Book) {
    return this.http.post<Book>(this.url, book);
  }

  uploadCoverImage(file: File) {
    const formData = new FormData();

    formData.append('file', file, file.name);

    return this.http.post<{ token: string }>(
      'https://www.thibaultmorizet.fr/assets/',
      formData
    );
  }

  getBooksBestSell() {
    return this.http.get<Array<Book>>(this.url + '?itemsPerPage=10');
  }
}
