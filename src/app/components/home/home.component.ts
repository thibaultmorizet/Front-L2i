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

import { ChangeDetectorRef, NgZone, ViewChild } from "@angular/core";
import { SwiperComponent } from "swiper/angular";

// import Swiper core and required components
import SwiperCore , {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
} from 'swiper';
import { BehaviorSubject } from "rxjs";
import Swiper from "swiper/types/swiper-class";

// install Swiper components
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller
]);


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
  bestBookArray: Array<number> = [0, 1, 2, 3,4];
  basket: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  bookBestSell: Array<Book> = [];
  bookExistinBasket: Boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;



  @ViewChild('swiperRef', { static: false }) swiperRef?: SwiperComponent;

  show?: boolean;
  thumbs: any;
  slides$ = new BehaviorSubject<string[]>(['']);



  constructor(
    private us: UserService,
    private as: AuthService,
    private bs: BookService,
    private authService: SocialAuthService,
    private router: Router,
    private iziToast: NgxIzitoastService,

    private cd: ChangeDetectorRef, private ngZone: NgZone
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
    for (let index = 0; index < this.bestBookArray.length; index++) {
      if (this.bestBookArray[index] < 9) {
        this.bestBookArray[index]++;
      } else {
        this.bestBookArray[index] = 0;
      }
    }
  }
  prevBestBook() {
    for (let index = 0; index < this.bestBookArray.length; index++) {
      if (this.bestBookArray[index] > 0) {
        this.bestBookArray[index]--;
      } else {
        this.bestBookArray[index] = 9;
      }
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




  getSlides() {
    this.slides$.next(Array.from({ length: 600 }).map((el, index) => `Slide ${index + 1}`));
  }

  thumbsSwiper: any;
  setThumbsSwiper(swiper:any) {
    this.thumbsSwiper = swiper;
  }
  controlledSwiper: any;
  setControlledSwiper(swiper:any) {
    this.controlledSwiper = swiper;
  }

  indexNumber = 1;
  exampleConfig = { slidesPerView: 3 };
  slidesPerView: number = 4;
  pagination: any = false;

  slides2 = ['slide 1', 'slide 2', 'slide 3'];
  replaceSlides() {
    this.slides2 = ['foo', 'bar'];
  }

  togglePagination() {
    if (!this.pagination) {
      this.pagination = { type: 'fraction' };
    } else {
      this.pagination = false;
    }
  }

  navigation = false;
  toggleNavigation() {
    this.navigation = !this.navigation;
  }

  scrollbar: any = false;
  toggleScrollbar() {
    if (!this.scrollbar) {
      this.scrollbar = { draggable: true };
    } else {
      this.scrollbar = false;
    }
  }
  breakpoints = {
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 4, spaceBetween: 40 },
    1024: { slidesPerView: 4, spaceBetween: 50 },
  };

  slides = Array.from({ length: 5 }).map((el, index) => `Slide ${index + 1}`);
  virtualSlides = Array.from({ length: 600 }).map((el, index) => `Slide ${index + 1}`);

  log(log: string) {
    // console.log(string);
  }

  breakPointsToggle?: boolean;
  breakpointChange() {
    this.breakPointsToggle = !this.breakPointsToggle;
    this.breakpoints = {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 4, spaceBetween: 40 },
      1024: { slidesPerView: this.breakPointsToggle ? 7 : 5, spaceBetween: 50 },
    };
  }

  slidesEx = ['first', 'second'];

  onSlideChange(swiper: any) {
    if (swiper.isEnd) {
      // all swiper events are run outside of ngzone, so use ngzone.run or detectChanges to update the view.
      this.ngZone.run(() => {
        this.slidesEx = [...this.slidesEx, `added ${this.slidesEx.length - 1}`];
      });
      console.log(this.slidesEx);
    }
  }

}
