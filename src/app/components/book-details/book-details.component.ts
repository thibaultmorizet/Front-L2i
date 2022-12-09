import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BookDetailsComponent implements OnInit {
  book: Book = {};
  idBook: number = 0;
  cart: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  bookExistinCart: Boolean = false;
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedUser: User | null = {};
  bookDetailsImgCoverIsLoaded: boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private bs: BookService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private authService: SocialAuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());

    this.route.paramMap.subscribe((res) => {
      this.idBook = +(res.get('id') ?? '0');
      this.bs.getOneBook(this.idBook).subscribe((b) => {
        this.book = b;
        this.book.number_ordered = 1;
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
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  addBookToCart(bookToOrder: Book) {
    this.bookExistinCart = false;
    if (bookToOrder.id != undefined) {
      this.bs.getOneBook(bookToOrder.id).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              bookToOrder.number_ordered &&
              el.number_ordered + bookToOrder.number_ordered > el.stock
            ) {
              this.iziToast.error({
                title: this.translate.instant('izitoast.lack_of_stock'),
                message: this.translate.instant(
                  'izitoast.lack_of_stock_message',
                  {
                    bookStock: res.stock,
                    bookTitle: res.title,
                    bookNumber: el.number_ordered + bookToOrder.number_ordered,
                  }
                ),
                position: 'topRight',
              });
            } else {
              if (
                el.number_ordered != undefined &&
                bookToOrder.number_ordered != undefined
              ) {
                el.number_ordered =
                  el.number_ordered + bookToOrder.number_ordered;

                if (el.unitpriceht) {
                  el.totalpriceht = parseFloat(
                    (el.number_ordered * el.unitpriceht).toFixed(2)
                  );
                  if (el.taxe?.tva) {
                    el.totalpricettc = parseFloat(
                      (
                        el.number_ordered *
                        (el.unitpriceht + (el.taxe.tva * el.unitpriceht) / 100)
                      ).toFixed(2)
                    );
                  }
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
          if (
            res.stock &&
            bookToOrder.number_ordered &&
            bookToOrder.number_ordered > res.stock
          ) {
            this.iziToast.error({
              title: this.translate.instant('izitoast.lack_of_stock'),
              message: this.translate.instant(
                'izitoast.lack_of_stock_message',
                {
                  bookStock: res.stock,
                  bookTitle: res.title,
                  bookNumber: bookToOrder.number_ordered,
                }
              ),
              position: 'topRight',
            });
          } else {
            res.number_ordered = bookToOrder.number_ordered;

            if (res.unitpriceht && res.number_ordered) {
              res.totalpriceht = parseFloat(
                (res.number_ordered * res.unitpriceht).toFixed(2)
              );
              if (res.taxe?.tva) {
                res.totalpricettc = parseFloat(
                  (
                    res.number_ordered *
                    (res.unitpriceht + (res.taxe.tva * res.unitpriceht) / 100)
                  ).toFixed(2)
                );
              }
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

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }
  getUnitpricettcFromUnitpricehtAndTva(
    unitpriceht: number | undefined,
    tva: number | undefined
  ) {
    if (unitpriceht != undefined) {
      if (tva != undefined) {
        return (unitpriceht + (tva * unitpriceht) / 100).toFixed(2);
      } else {
        return unitpriceht.toFixed(2);
      }
    } else {
      return null;
    }
  }
}
