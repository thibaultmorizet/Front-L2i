import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css', './../../../css/main.css'],
})
export class BookDetailsComponent implements OnInit {
  book: Book = {};
  idBook: number = 0;
  basket: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  bookExistinBasket: Boolean = false;
  numberToOrder: string = '1';
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedUser: User | null = {};

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private bs: BookService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private authService: SocialAuthService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((res) => {
      this.idBook = +(res.get('id') ?? '0');
      this.bs.getOneBook(this.idBook).subscribe((b) => {
        this.book = b;

        if (this.book.visitnumber) {
          this.book.visitnumber += 1;
        } else {
          this.book.visitnumber = 1;
        }

        this.bs.updateBook(this.book.id, this.book).subscribe(() => {});
      });
      try {
        this.connectedUser = JSON.parse(
          this.storageCrypter.getItem('user', 'session')
        );
      } catch (error) {
        this.connectedUser = null;
      }
      if (this.storageCrypter.getItem('basket', 'local') != '') {
        this.basket = JSON.parse(
          this.storageCrypter.getItem('basket', 'local')
        );
      }
      this.authService.authState.subscribe((user) => {
        this.socialUser = user;
        this.isLoggedin = user != null;
      });
      if (this.storageCrypter.getItem('jeton', 'local')) {
        if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
          this.refreshToken();
        }
      }
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
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
              el.stock &&
              el.number_ordered &&
              el.number_ordered + parseInt(this.numberToOrder) > el.stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.number_ordered + parseInt(this.numberToOrder)),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered =
                  el.number_ordered + parseInt(this.numberToOrder);
                if (el.unitprice) {
                  el.totalprice = parseFloat(
                    (el.number_ordered * el.unitprice).toFixed(2)
                  );
                }
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
          if (res.stock && parseInt(this.numberToOrder) > res.stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.stock +
                ' exemplaires de ce livre et vous en demandez ' +
                parseInt(this.numberToOrder),
              position: 'topRight',
            });
          } else {
            res.number_ordered = parseInt(this.numberToOrder);
            if (res.unitprice) {
              res.totalprice = parseFloat(
                (res.number_ordered * res.unitprice).toFixed(2)
              );
            }

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

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  refreshToken() {
    if (!this.storageCrypter.getItem('user', 'session')) {
      this.storageCrypter.removeItem('jeton', 'local');
    }

    this.as
      .login(JSON.parse(this.storageCrypter.getItem('user', 'session')))
      .subscribe({
        next: (res) => {
          if (res.token != null) {
            this.storageCrypter.setItem('jeton', res.token, 'local');
          }
        },
        error: (res) => {
          this.logout();
        },
      });
  }
}
