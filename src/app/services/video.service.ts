import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Brand} from '../interfaces/brand';
import {Product} from '../interfaces/product';
import {Video} from '../interfaces/video';
import {Category} from "../interfaces/category";

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private url: string = 'https://thibaultmorizet.fr/ws/videos';
  private urlWithoutLimit: string =
    'https://thibaultmorizet.fr/ws/videos?itemsPerPage=10000';

  private videos: Array<object> = [];
  private inStockString: string = '';
  private searchString: string = '';
  private pricesString: string = '';
  private brandsString: string = '';
  private categoriesString: string = '';

  constructor(private http: HttpClient) {
  }

  getAllVideos(inStock: boolean) {
    if (inStock) {
      this.inStockString = '?stock%5Bgt%5D=0';
    }
    if (!inStock) {
      this.inStockString = '?stock%5Blte%5D=0';
    }
    return this.http.get<Array<Video>>(this.url + this.inStockString);
  }

  getOneVideo(id: number) {
    return this.http.get<Video>('https://thibaultmorizet.fr/ws/videos/' + id);
  }

  getAllVideosBySearchAndParameters(
    brands: Array<Brand>,
    categories: Array<Category>,
    search: string,
    prices: Array<number>,
    productnumber: number,
    inStock: boolean
  ) {
    this.brandsString = '';
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
    brands.forEach((el) => {
      this.brandsString += '&brand.name[]=' + el.name;
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
    }
    if (!inStock) {
      this.inStockString = '&stock%5Blte%5D=0';
    }
    return this.http.get<Array<Video>>(
      'https://thibaultmorizet.fr/ws/videos?' +
      'itemsPerPage=' +
      productnumber +
      this.brandsString +
      this.categoriesString +
      this.pricesString +
      this.searchString +
      this.inStockString
    );
  }

  getAllVideosForPage(
    page: number,
    productnumber: number,
    brands: Array<Brand>,
    categories: Array<Category>,
    search: string,
    prices: Array<number>,
    inStock: boolean
  ) {
    this.brandsString = '';
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
    brands.forEach((el) => {
      this.brandsString += '&brand.name[]=' + el.name;
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
    }
    if (!inStock) {
      this.inStockString = '&stock%5Blte%5D=0';
    }
    return this.http.get<Array<Video>>(
      'https://thibaultmorizet.fr/ws/videos?page=' +
      page +
      '&itemsPerPage=' +
      productnumber +
      this.brandsString +
      this.categoriesString +
      this.pricesString +
      this.searchString +
      this.inStockString
    );
  }

  getAllVideosWithoutLimit(
    search: string,
    prices: Array<number>,
    inStock: boolean | null
  ) {
    this.searchString = '';
    this.pricesString = '';
    this.inStockString = '';

    if (search.length > 0) {
      this.searchString = '&title=' + search;
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
    }
    if (inStock != null) {
      if (inStock) {
        this.inStockString = '&stock%5Bgt%5D=0';
      }
      if (!inStock) {
        this.inStockString = '&stock%5Blte%5D=0';
      }
    }
    return this.http.get<Array<Product>>(
      this.urlWithoutLimit +
      this.pricesString +
      this.searchString +
      this.inStockString
    );
  }

  createVideo(video: Video) {
    return this.http.post<Video>(this.url, video);
  }

  updateVideo(id: number | undefined, video: Video) {
    return this.http.put<{ token: string }>(this.url + '/' + id, video);
  }

  deleteTheVideo(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
