import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-basket-details',
  templateUrl: './basket-details.component.html',
  styleUrls: ['./basket-details.component.css', './../../../css/main.css'],
})
export class BasketDetailsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];
  connectedUser: User | null = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  basketTotalPrice: number = 0;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private authService: SocialAuthService
  ) {}

  ngOnInit(): void {
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }

    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
    }
    this.basket.forEach((el) => {
      if (el.totalprice) {
        this.basketTotalPrice += el.totalprice;
        this.basketTotalPrice = parseFloat(this.basketTotalPrice.toFixed(2));
      }
    });
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

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  decreaseBookQuantity(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (el.number_ordered != undefined && el.number_ordered == 1) {
          this.deleteBookOfBasket(el.id);
        }
        if (el.number_ordered != undefined && el.number_ordered > 0) {
          if (el.totalprice != undefined && el.unitpricettc) {
            el.number_ordered--;
            el.totalprice -= el.unitpricettc;
            this.basketTotalPrice -= el.unitpricettc;
            this.basketTotalPrice = parseFloat(
              this.basketTotalPrice.toFixed(2)
            );
            el.totalprice = parseFloat(el.totalprice.toFixed(2));
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
          el.number_ordered != undefined &&
          el.stock != undefined &&
          el.number_ordered < el.stock
        ) {
          if (el.totalprice != undefined && el.unitpricettc) {
            el.number_ordered++;
            el.totalprice += el.unitpricettc;
            this.basketTotalPrice += el.unitpricettc;
            this.basketTotalPrice = parseFloat(
              this.basketTotalPrice.toFixed(2)
            );
            el.totalprice = parseFloat(el.totalprice.toFixed(2));
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        } else {
          this.iziToast.error({
            message:
              'Cet article est disponible en ' + el.stock + ' exemplaire(s)',
            position: 'topRight',
          });
        }
      }
    });
  }

  deleteBookOfBasket(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (el.totalprice) {
          this.basketTotalPrice -= el.totalprice;
          this.basketTotalPrice = parseFloat(this.basketTotalPrice.toFixed(2));
        }
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
