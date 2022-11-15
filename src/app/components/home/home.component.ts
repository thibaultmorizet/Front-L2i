import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { PrimeNGConfig } from 'primeng/api';
import { CarouselModule } from 'primeng/carousel';
import { Book } from 'src/app/interfaces/book';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { BookService } from 'src/app/services/book.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  cart: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  bookBestSell: Array<Book> = [];
  responsiveOptions: any;
  bookExistinCart: Boolean = false;
  @ViewChild('bestSellCarousel') bestSellCarousel?: CarouselModule;
  carouselIsLoaded: boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private as: AuthService,
    private bs: BookService,
    private authService: SocialAuthService,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    this.responsiveOptions = [
      {
        breakpoint: '3000px',
        numVisible: 6,
        numScroll: 1,
      },
      {
        breakpoint: '2600px',
        numVisible: 5,
        numScroll: 1,
      },
      {
        breakpoint: '1800px',
        numVisible: 4,
        numScroll: 1,
      },
      {
        breakpoint: '1300px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1000px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '650px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    this.getBooksBestSell();
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      }
    }
    if (document.getElementsByClassName('p-carousel-indicators')[0]) {
      (
        document.getElementsByClassName(
          'p-carousel-indicators'
        )[0] as HTMLElement
      ).click();
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
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }

  nextBestBook() {
    (
      document.getElementsByClassName('p-carousel-next')[0] as HTMLElement
    ).click();
  }

  prevBestBook() {
    (
      document.getElementsByClassName('p-carousel-prev')[0] as HTMLElement
    ).click();
  }
  addBookToCart(bookId: number | undefined) {
    this.bookExistinCart = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              el.number_ordered + 1 > el.stock
            ) {
              this.iziToast.error({
                title: this.translate.instant('izitoast.lack_of_stock'),
                message: this.translate.instant(
                  'izitoast.lack_of_stock_message',
                  {
                    bookStock: res.stock,
                    bookTitle: res.title,
                    bookNumber: el.number_ordered + 1,
                  }
                ),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered = el.number_ordered + 1;
                if (el.unitpricettc) {
                  el.totalpricettc = parseFloat(
                    (el.number_ordered * el.unitpricettc).toFixed(2)
                  );
                }
                if (el.unitpriceht) {
                  el.totalpriceht = parseFloat(
                    (el.number_ordered * el.unitpriceht).toFixed(2)
                  );
                }
                this.iziToast.success({
                  message: this.translate.instant('izitoast.book_add_to_cart'),
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'cart',
                  JSON.stringify(this.cart),
                  'local'
                );
              }
            }
          }
        });

        if (!this.bookExistinCart) {
          if (res.stock && 1 > res.stock) {
            this.iziToast.error({
              title: this.translate.instant('izitoast.lack_of_stock'),
              message: this.translate.instant(
                'izitoast.lack_of_stock_message',
                {
                  bookStock: res.stock,
                  bookTitle: res.title,
                  bookNumber: 1,
                }
              ),
              position: 'topRight',
            });
          } else {
            res.number_ordered = 1;
            if (res.unitpricettc) {
              res.totalpricettc = parseFloat(
                (res.number_ordered * res.unitpricettc).toFixed(2)
              );
            }
            if (res.unitpriceht) {
              res.totalpriceht = parseFloat(
                (res.number_ordered * res.unitpriceht).toFixed(2)
              );
            }

            this.cart.push(res);
            this.iziToast.success({
              message: this.translate.instant('izitoast.book_add_to_cart'),
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'cart',
              JSON.stringify(this.cart),
              'local'
            );
          }
        }
      });
    }
  }
}
