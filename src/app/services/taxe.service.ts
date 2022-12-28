import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Taxe } from '../interfaces/taxe';

@Injectable({
  providedIn: 'root'
})
export class TaxeService {
  private url: string = 'https://thibaultmorizet.fr/ws/taxes';

  constructor(private http: HttpClient) {}

  getAllTaxes() {
    return this.http.get<Array<Taxe>>(this.url);
  }

  getTaxeByTva(tva: Number | undefined) {
    return this.http.get<Array<Taxe>>(
      'https://thibaultmorizet.fr/ws/taxes?tva=' + tva
    );
  }

  setTaxe(taxe: Taxe) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/ws/taxes',
      taxe
    );
  }

  updateTaxe(id: number | undefined, taxe: Taxe) {
    return this.http.put<{ token: string }>(this.url + '/' + id, taxe);
  }

  deleteTheTaxe(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }

}
