import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Brand } from '../interfaces/brand';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private url: string = 'https://thibaultmorizet.fr/ws/brands';
  private brands: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllBrands() {
    return this.http.get<Array<Brand>>(this.url);
  }
  getBrandByName(name: String | undefined) {
    return this.http.get<Array<Brand>>(
      'https://thibaultmorizet.fr/ws/brands?name=' + name
    );
  }
  setBrand(brand: Brand) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/ws/brands',
      brand
    );
  }
  updateBrand(id: number | undefined, brand: Brand) {
    return this.http.put<{ token: string }>(this.url + '/' + id, brand);
  }

  createBrand(brand: Brand) {
    return this.http.post<Brand>(this.url, brand);
  }
  deleteTheBrand(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }


}
