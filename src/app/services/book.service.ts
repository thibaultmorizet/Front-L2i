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
  private inStockString: string = '';

  constructor(private http: HttpClient) {}

  getAllBooks(inStock: boolean) {
    if (inStock) {
      this.inStockString = '?stock%5Bgt%5D=0';
    } else {
      this.inStockString = '?stock%5Blte%5D=0';
    }
    return this.http.get<Array<Book>>(this.url + this.inStockString);
  }
  getOneBook(id: number) {
    return this.http.get<Book>('https://thibaultmorizet.fr/ws/books/' + id);
  }
  getAllBooksWithoutLimit(
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>,
    inStock: boolean | null
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';
    this.pricesString = '';
    this.inStockString = '';

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
        '&unitpriceht[between]=' +
        Math.ceil(prices[0] - (5.5 * prices[0]) / 100) +
        '..' +
        Math.ceil(prices[1] - (5.5 * prices[1]) / 100);
    }
    if (inStock == null) {
      this.inStockString = '';
    } else if (inStock) {
      this.inStockString = '&stock%5Bgt%5D=0';
    } else {
      this.inStockString = '&stock%5Blte%5D=0';
    }
    return this.http.get<Array<Book>>(
      this.urlWithoutLimit +
        this.formatsString +
        this.typesString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }
  getAllBooksForPage(
    page: number,
    booknumber: number,
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>,
    inStock: boolean
  ) {
    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';
    this.inStockString = '';

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
        '&unitpriceht[between]=' +
        Math.ceil(prices[0] - (5.5 * prices[0]) / 100) +
        '..' +
        Math.ceil(prices[1] - (5.5 * prices[1]) / 100);
    }
    if (inStock) {
      this.inStockString = '&stock%5Bgt%5D=0';
    } else {
      this.inStockString = '&stock%5Blte%5D=0';
    }
    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?page=' +
        page +
        '&itemsPerPage=' +
        booknumber +
        this.formatsString +
        this.typesString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }

  getAllBooksByFormatAndTypeAndSearch(
    formats: Array<Format>,
    types: Array<Type>,
    search: string,
    prices: Array<number>,
    booknumber: number,
    inStock: boolean
  ) {
    console.log(prices);

    this.formatsString = '';
    this.typesString = '';
    this.searchString = '';
    this.pricesString = '';
    this.inStockString = '';

    if (search && search.length > 0) {
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
    if (typeof prices[0] == 'number' && typeof prices[1] == 'number') {
      this.pricesString +=
        '&unitpriceht[between]=' +
        Math.ceil(prices[0] - (5.5 * prices[0]) / 100) +
        '..' +
        Math.ceil(prices[1] - (5.5 * prices[1]) / 100);
    }
    if (inStock) {
      this.inStockString = '&stock%5Bgt%5D=0';
    } else {
      this.inStockString = '&stock%5Blte%5D=0';
    }
    return this.http.get<Array<Book>>(
      'https://thibaultmorizet.fr/ws/books?' +
        'itemsPerPage=' +
        booknumber +
        this.formatsString +
        this.typesString +
        this.pricesString +
        this.searchString +
        this.inStockString
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

  deleteTheBook(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
  addImage(imageInfo: object) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/add_image',
      imageInfo
    );
  }
  deleteImage(imageUrl: object) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/delete_image',
      imageUrl
    );
  }
}
