import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from '../interfaces/address';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private url: string = 'https://back-l2i.thibaultmorizet.fr/ws/addresses';

  constructor(private http: HttpClient) {}

  getTheAddress(id: number | undefined) {
    return this.http.get<Address>(this.url + '/' + id);
  }

  updateAddress(id: number | undefined, address: Address) {
    return this.http.put<{ token: string }>(this.url + '/' + id, address);
  }

  createAddress(address: Address) {
    return this.http.post<Address>(this.url, address);
  }
  deleteTheAddress(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
