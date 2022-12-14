import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../interfaces/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private url: string = 'https://thibaultmorizet.fr/ws/orders';
  private orders: Array<Order> = [];

  constructor(private http: HttpClient) {}

  getAllOrders() {
    return this.http.get<Array<Order>>(this.url);
  }
  getUserOrders(user_id: number) {
    return this.http.get<Array<Order>>(this.url + '?user.id=' + user_id);
  }
  setOrder(order: Order) {    
    return this.http.post<{ token: string }>(this.url, order);
  }
}
