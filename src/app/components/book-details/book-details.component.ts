import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
})
export class BookDetailsComponent implements OnInit {
  book: Book = {};
  idBook: number = 0;
  basket: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  bookExistinBasket: Boolean = false;
  numberToOrder: string = '1';

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((res) => {
      this.idBook = +(res.get('id') ?? '0');
      this.bs.getOneBook(this.idBook).subscribe((b) => {
        this.book = b;
      });
      if (this.storageCrypter.getItem('basket', 'local') != '') {
        this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));        
      }
  
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  addBookToBasket(event: any, bookId: number | undefined) {
    this.numberToOrder = event.target.querySelector('select').value;

    this.bookExistinBasket = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.basket.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinBasket = true;

            if (
              el.book_stock &&
              el.book_number_ordered &&
              el.book_number_ordered + parseInt(this.numberToOrder) >
                el.book_stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.book_stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.book_number_ordered + parseInt(this.numberToOrder)),
                position: 'topRight',
              });
            } else {
              if (el.book_number_ordered != undefined) {
                el.book_number_ordered =
                  el.book_number_ordered + parseInt(this.numberToOrder);
                this.iziToast.success({
                  message: 'Article ajouté au panier',
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'basket',
                  JSON.stringify(this.basket),
                  'local'
                );
              }
            }
          }
        });

        if (!this.bookExistinBasket) {
          if (res.book_stock && parseInt(this.numberToOrder) > res.book_stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.book_stock +
                ' exemplaires de ce livre et vous en demandez ' +
                parseInt(this.numberToOrder),
              position: 'topRight',
            });
          } else {
            res.book_number_ordered = parseInt(this.numberToOrder);
            this.basket.push(res);
            this.iziToast.success({
              message: 'Article ajouté au panier',
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        }
      });
    }
  }

}
