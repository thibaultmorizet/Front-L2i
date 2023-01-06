import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../interfaces/book';
import { Category } from '../interfaces/category';
import { Format } from '../interfaces/format';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private url: string = 'https://thibaultmorizet.fr/ws/books';
  private urlWithoutLimit: string =
    'https://thibaultmorizet.fr/ws/books?itemsPerPage=10000';

  private books: Array<object> = [];
  private inStockString: string = '';
  private searchString: string = '';
  private pricesString: string = '';
  private formatsString: string = '';
  private categoriesString: string = '';

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

  getAllBooksBySearchAndParameters(
    formats: Array<Format>,
    categories: Array<Category>,
    search: string,
    prices: Array<number>,
    productnumber: number,
    inStock: boolean
  ) {
    this.formatsString = '';
    this.categoriesString = '';
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
    categories.forEach((el) => {
      this.categoriesString += '&category.name[]=' + el.name;
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
        productnumber +
        this.formatsString +
        this.categoriesString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }

  getAllBooksForPage(
    page: number,
    productnumber: number,
    formats: Array<Format>,
    categories: Array<Category>,
    search: string,
    prices: Array<number>,
    inStock: boolean
  ) {
    this.formatsString = '';
    this.categoriesString = '';
    this.searchString = '';
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
    categories.forEach((el) => {
      this.categoriesString += '&category.name[]=' + el.name;
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
        productnumber +
        this.formatsString +
        this.categoriesString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }

  getAllBooksWithoutLimit(
    search: string,
    prices: Array<number>,
    inStock: boolean | null
  ) {
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
    return this.http.get<Array<Product>>(
      this.urlWithoutLimit +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }
}
