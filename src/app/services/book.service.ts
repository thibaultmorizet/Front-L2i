import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../interfaces/book';
import { Format } from '../interfaces/format';
import { Type } from '../interfaces/type';

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
  private pricesString: string = '';

  constructor(private http: HttpClient) {}

  getAllBooks() {
    return this.http.get<Array<Book>>(this.url);
  }
  getOneBook(id: number) {
    return this.http.get<Book>('https://thibaultmorizet.fr/ws/books/' + id);
  }
  getAllBooksWithoutLimit(
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';
    this.pricesString = '';

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
      this.formatsString += '&format.name[]=' + el.name;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el.name;
    });
    if (prices[0] && prices[1]) {
      this.pricesString +=
        '&unitpricettc[between]=' + prices[0] + '..' + prices[1];
    }
    return this.http.get<Array<Book>>(
      this.urlWithoutLimit +
        this.formatsString +
        this.typesString +
        this.pricesString +
        this.searchString
    );
  }
  getAllBooksForPage(
    page: number,
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>
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
      this.formatsString += '&format.name[]=' + el.name;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el.name;
    });
    if (prices[0] && prices[1]) {
      this.pricesString +=
        '&unitpricettc[between]=' + prices[0] + '..' + prices[1];
    }
    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?page=' +
        page +
        this.formatsString +
        this.typesString +
        this.pricesString +
        this.searchString
    );
  }

  getAllBooksByFormatAndTypeAndSearch(
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';
    this.pricesString = '';

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
      this.formatsString += '&format.name[]=' + el.name;
    });
    types.forEach((el) => {
      this.typesString += '&type.name[]=' + el.name;
    });
    if (prices[0] && prices[1]) {
      this.pricesString +=
        '&unitpricettc[between]=' + prices[0] + '..' + prices[1];
    }

    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?' +
        this.formatsString +
        this.typesString +
        this.pricesString +
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
    return this.http.get<Array<Book>>(
      this.url + '?itemsPerPage=10&stock%5Bgt%5D=0'
    );
  }

  updateBookStock(id: number | undefined, book: Book) {
    if (book.stock && book.stock >= 0) {
      return this.http.put<{ token: string }>(this.url + '/' + id, book);
    } else {
      return false;
    }
  }
}
