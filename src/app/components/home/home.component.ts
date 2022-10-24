import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './home.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class HomeComponent implements OnInit {
  menuIsVisible: boolean = false;
  bestBookSelected: number = 0;
  bestBookArray: Array<number> = [0, 1, 2];
  basket: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  bookBestSell: Array<Book> = [];
  bookExistinBasket: Boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private us: UserService,
    private as: AuthService,
    private bs: BookService,
    private authService: SocialAuthService,
    private router: Router,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit(): void {
    this.getBooksBestSell();
    try {
      this.getUserByEmail(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).email
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
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
  }
  getBooksBestSell() {
    this.bs.getBooksBestSell().subscribe((res) => {
      this.bookBestSell = res;
    });
  }
  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      this.storageCrypter.setItem('user', JSON.stringify(res[0]), 'session');
      this.connectedUser = res[0];
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

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  toggleMenu() {
    this.menuIsVisible = !this.menuIsVisible;
  }

  nextBestBook() {
    if (this.bestBookSelected < 9) {
      this.bestBookSelected++;
    } else {
      this.bestBookSelected = 0;
    }
  }
  prevBestBook() {
    if (this.bestBookSelected > 0) {
      this.bestBookSelected--;
    } else {
      this.bestBookSelected = 9;
    }
  }

  addBookToBasket(bookId: number | undefined) {
    this.bookExistinBasket = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.basket.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinBasket = true;

            if (
              el.stock &&
              el.number_ordered &&
              el.number_ordered + 1 > el.stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.number_ordered + 1),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered = el.number_ordered + 1;
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
          if (res.stock && 1 > res.stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.stock +
                ' exemplaires de ce livre et vous en demandez ' +
                1,
              position: 'topRight',
            });
          } else {
            res.number_ordered = 1;
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
}
