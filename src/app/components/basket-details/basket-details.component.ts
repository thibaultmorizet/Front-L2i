import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import StorageCrypter from 'storage-crypter';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-basket-details',
  templateUrl: './basket-details.component.html',
  styleUrls: ['./basket-details.component.css'],
})
export class BasketDetailsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit(): void {
    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
    }
  }

  decreaseBookQuantity(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (
          el.book_number_ordered != undefined &&
          el.book_number_ordered == 1
        ) {
          this.deleteBookOfBasket(el.id);
        }
        if (el.book_number_ordered != undefined && el.book_number_ordered > 0) {
          if (el.book_total_price != undefined && el.book_unit_price) {
            el.book_number_ordered--;
            el.book_total_price -= el.book_unit_price;
            el.book_total_price = parseFloat(el.book_total_price.toFixed(2));
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        } else {
          this.iziToast.error({
            message: 'Vous ne pouvez pas demander une quantité négative',
            position: 'topRight',
          });
        }
      }
    });
  }

  increaseBookQuantity(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (
          el.book_number_ordered != undefined &&
          el.book_stock != undefined &&
          el.book_number_ordered < el.book_stock
        ) {
          if (el.book_total_price != undefined && el.book_unit_price) {
            el.book_number_ordered++;
            el.book_total_price += el.book_unit_price;
            el.book_total_price = parseFloat(el.book_total_price.toFixed(2));
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        } else {
          this.iziToast.error({
            message:
              'Cet article est disponible en ' +
              el.book_stock +
              ' exemplaire(s)',
            position: 'topRight',
          });
        }
      }
    });
  }

  deleteBookOfBasket(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        const index = this.basket.indexOf(el, 0);
        if (index > -1) {
          this.basket.splice(index, 1);
        }
        this.storageCrypter.setItem(
          'basket',
          JSON.stringify(this.basket),
          'local'
        );
      }
    });
  }
}
