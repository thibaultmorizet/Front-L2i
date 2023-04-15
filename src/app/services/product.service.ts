import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Product} from '../interfaces/product';
import {Format} from '../interfaces/format';
import {Category} from '../interfaces/category';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private url: string = 'https://thibaultmorizet.fr/ws/products';
  private urlWithoutLimit: string =
    'https://thibaultmorizet.fr/ws/products?itemsPerPage=10000';
  private products: Array<object> = [];
  private searchString: string = '';
  private pricesString: string = '';
  private inStockString: string = '';
  private categoriesString: string = '';

  constructor(private http: HttpClient) {
  }

  getAllProducts(inStock: boolean) {
    if (inStock) {
      this.inStockString = '?stock%5Bgt%5D=0';
    }
    if (!inStock) {
      this.inStockString = '?stock%5Blte%5D=0';
    }
    return this.http.get<Array<Product>>(this.url + this.inStockString);
  }

  getOneProduct(id: number) {
    return this.http.get<Product>(
      'https://thibaultmorizet.fr/ws/products/' + id
    );
  }

  getAllProductsWithoutLimit(
    search: string,
    categories: Array<Category>,
    prices: Array<number>,
    inStock: boolean | null
  ) {
    this.searchString = '';
    this.categoriesString = '';
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
      this.categoriesString +
      this.inStockString
    );
  }

  getAllProductsForPage(
    page: number,
    productnumber: number,
    search: string,
    categories: Array<Category>,
    prices: Array<number>,
    inStock: boolean
  ) {
    this.searchString = '';
    this.categoriesString = '';
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
    return this.http.get<Array<Product>>(
      'https://thibaultmorizet.fr/ws/products?page=' +
      page +
      '&itemsPerPage=' +
      productnumber +
      this.pricesString +
      this.searchString +
      this.categoriesString +
      this.inStockString
    );
  }

  getAllProductsBySearch(
    search: string,
    categories: Array<Category>,
    prices: Array<number>,
    productnumber: number,
    inStock: boolean
  ) {
    this.searchString = '';
    this.categoriesString = '';
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
    return this.http.get<Array<Product>>(
      'https://thibaultmorizet.fr/ws/products?' +
      'itemsPerPage=' +
      productnumber +
      this.pricesString +
      this.searchString +
      this.categoriesString +
      this.inStockString
    );
  }

  updateProduct(id: number | undefined, product: Product) {
    return this.http.put<{ token: string }>(this.url + '/' + id, product);
  }

  createProduct(product: Product) {
    return this.http.post<Product>(this.url, product);
  }

  getProductsBestSell() {
    return this.http.get<Array<Product>>(
      this.url + '?itemsPerPage=10&stock%5Bgt%5D=0'
    );
  }

  updateProductStock(id: number | undefined, product: Product) {
    if (product.stock && product.stock >= 0) {
      return this.http.put<{ token: string }>(this.url + '/' + id, product);
    }
    return false;
  }

  deleteTheProduct(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }

  uploadCoverImage(file: File) {
    const formData = new FormData();

    formData.append('file', file, file.name);

    return this.http.post<{ token: string }>(
      'https://www.thibaultmorizet.fr/assets/',
      formData
    );
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
