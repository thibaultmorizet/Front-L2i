import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from '../interfaces/address';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private url: string = 'https://thibaultmorizet.fr/ws/address';

  constructor(private http: HttpClient) {}

  updateAddress(id: number | undefined, address: Address) {
    return this.http.put<{ token: string }>(this.url + '/' + id, address);
  }
}
