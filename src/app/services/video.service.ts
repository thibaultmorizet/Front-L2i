import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Brand } from '../interfaces/brand';
import { Video } from '../interfaces/video';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private url: string = 'https://thibaultmorizet.fr/ws/videos';
  private videos: Array<object> = [];
  private inStockString: string = '';
  private searchString: string = '';
  private pricesString: string = '';
  private brandsString: string = '';

  constructor(private http: HttpClient) {}

  getAllVideos(inStock: boolean) {
    if (inStock) {
      this.inStockString = '?stock%5Bgt%5D=0';
    } else {
      this.inStockString = '?stock%5Blte%5D=0';
    }
    return this.http.get<Array<Video>>(this.url + this.inStockString);
  }
  getOneVideo(id: number) {
    return this.http.get<Video>('https://thibaultmorizet.fr/ws/videos/' + id);
  }

  getAllVideosBySearchAndParameters(
    brands: Array<Brand>,
    search: string,
    prices: Array<number>,
    productnumber: number,
    inStock: boolean
  ) {
    this.brandsString = '';
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
    brands.forEach((el) => {
      this.brandsString += '&brand.name[]=' + el.name;
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
    return this.http.get<Array<Video>>(
      'https://thibaultmorizet.fr/ws/videos?' +
        'itemsPerPage=' +
        productnumber +
        this.brandsString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }

  getAllVideosForPage(
    page: number,
    productnumber: number,
    brands: Array<Brand>,
    search: string,
    prices: Array<number>,
    inStock: boolean
  ) {
    this.brandsString = '';
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
    brands.forEach((el) => {
      this.brandsString += '&brand.name[]=' + el.name;
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
    return this.http.get<Array<Video>>(
      'https://thibaultmorizet.fr/ws/videos?page=' +
        page +
        '&itemsPerPage=' +
        productnumber +
        this.brandsString +
        this.pricesString +
        this.searchString +
        this.inStockString
    );
  }

}
