import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Format } from '../interfaces/format';

@Injectable({
  providedIn: 'root',
})
export class FormatService {
  private url: string = 'https://thibaultmorizet.fr/ws/formats';
  private formats: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllFormats() {
    return this.http.get<Array<Format>>(this.url);
  }
  getFormatByName(name: String | undefined) {
    return this.http.get<Array<Format>>(
      'https://thibaultmorizet.fr/ws/formats?name=' + name
    );
  }
  setFormat(format: Format) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/ws/formats',
      format
    );
  }
  updateFormat(id: number | undefined, format: Format) {
    return this.http.put<{ token: string }>(this.url + '/' + id, format);
  }

  createFormat(format: Format) {
    return this.http.post<Format>(this.url, format);
  }
  deleteTheFormat(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
