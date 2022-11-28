import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { AddressService } from 'src/app/services/address.service';
import { UserService } from 'src/app/services/user.service';
import { Address } from 'src/app/interfaces/address';
import { BookService } from 'src/app/services/book.service';
import { Order } from 'src/app/interfaces/order';
import { OrderService } from 'src/app/services/order.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class CartDetailsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  cart: Array<Book> = [];
  connectedUser: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  cartTotalPriceTtc: number = 0;
  cartTotalPriceHt: number = 0;
  cartDetailsQuantity: Array<number> = [];
  socialUser!: SocialUser;
  isLoggedin?: boolean;
  deliveryDate?: string;
  displayModalDeliveryAddress: boolean = false;
  displayModalBillingAddress: boolean = false;
  newAddressBilling: Address = {};
  newAddressDelivery: Address = {};
  errorStock: boolean = false;
  order: Order = {};

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private authService: SocialAuthService,
    private primengConfig: PrimeNGConfig,
    private addressService: AddressService,
    private us: UserService,
    private bs: BookService,
    private os: OrderService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = {};
    }

    if (this.connectedUser.id) {
      try {
        if (
          JSON.parse(this.storageCrypter.getItem('user', 'session'))
            ?.billingAddress?.id != undefined
        ) {
          this.addressService
            .getTheAddress(
              JSON.parse(this.storageCrypter.getItem('user', 'session'))
                .billingAddress.id
            )
            .subscribe((res) => {
              this.newAddressBilling = res;
            });
        }
      } catch (error) {
        this.newAddressBilling = {};
      }
      try {
        if (
          JSON.parse(this.storageCrypter.getItem('user', 'session'))
            ?.deliveryAddress?.id != undefined
        ) {
          this.addressService
            .getTheAddress(
              JSON.parse(this.storageCrypter.getItem('user', 'session'))
                .deliveryAddress.id
            )
            .subscribe((res) => {
              this.newAddressDelivery = res;
            });
        }
      } catch (error) {
        this.newAddressDelivery = {};
      }
    }

    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
      this.cart.forEach((el) => {
        if (el.totalpricettc) {
          this.cartTotalPriceTtc += el.totalpricettc;
          this.cartTotalPriceTtc = parseFloat(
            this.cartTotalPriceTtc.toFixed(2)
          );
        }
        if (el.totalpriceht) {
          this.cartTotalPriceHt += el.totalpriceht;
          this.cartTotalPriceHt = parseFloat(this.cartTotalPriceHt.toFixed(2));
        }
      });
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
    this.getDeliveryDate();
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  deleteBookOfCart(bookId: number | undefined) {
    this.cart.forEach((el) => {
      if (el.id == bookId) {
        if (el.totalpricettc) {
          this.cartTotalPriceTtc -= el.totalpricettc;
          this.cartTotalPriceTtc = parseFloat(
            this.cartTotalPriceTtc.toFixed(2)
          );
        }
        if (el.totalpriceht) {
          this.cartTotalPriceHt -= el.totalpriceht;
          this.cartTotalPriceHt = parseFloat(this.cartTotalPriceHt.toFixed(2));
        }

        const index = this.cart.indexOf(el, 0);
        if (index > -1) {
          this.cart.splice(index, 1);
        }
      }
    });

    this.storageCrypter.setItem('cart', JSON.stringify(this.cart), 'local');
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.authService.signOut();
    this.connectedUser = {};
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
    this.router.navigateByUrl('/home');
  }

  updateQuantity(bookId: number | undefined, numberOrdered: number) {
    if (numberOrdered == 0) {
      numberOrdered = 1;
    }
    this.cartTotalPriceTtc = 0;
    this.cartTotalPriceHt = 0;
    this.cart.forEach((el) => {
      if (el.stock) {
        if (numberOrdered > el.stock) {
          numberOrdered = el.stock;
        }
      }
      if (el.id == bookId) {
        el.number_ordered = numberOrdered;
      }
      if (el.number_ordered && el.unitpricettc) {
        el.totalpricettc = el.number_ordered * el.unitpricettc;
        this.cartTotalPriceTtc += el.number_ordered * el.unitpricettc;
      }
      if (el.number_ordered && el.unitpriceht) {
        el.totalpriceht = el.number_ordered * el.unitpriceht;
        this.cartTotalPriceHt += el.number_ordered * el.unitpriceht;
      }
    });
    this.cartTotalPriceTtc = parseFloat(this.cartTotalPriceTtc.toFixed(2));
    this.cartTotalPriceHt = parseFloat(this.cartTotalPriceHt.toFixed(2));
    this.storageCrypter.setItem('cart', JSON.stringify(this.cart), 'local');
  }

  getDeliveryDate() {
    let deliveryDelai = 6;
    let deliveryDate = new Date();
    const englishMonthNames = [
      'Jan.',
      'Feb.',
      'March',
      'April',
      'May',
      'June',
      'July',
      'Aug.',
      'Sept.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];
    const frenchMonthNames = [
      'Jan.',
      'Fev.',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juill.',
      'Août',
      'Sept.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];

    deliveryDate.setDate(deliveryDate.getDate() + deliveryDelai);
    if (this.translate.getDefaultLang() == 'fr') {
      this.deliveryDate =
        ' ' +
        frenchMonthNames[deliveryDate.getMonth()] +
        ' ' +
        deliveryDate.getDate();
    } else {
      this.deliveryDate =
        ' ' +
        englishMonthNames[deliveryDate.getMonth()] +
        ' ' +
        deliveryDate.getDate();
    }
  }

  showModalDeliveryAddress() {
    this.displayModalDeliveryAddress = true;
  }

  showModalBillingAddress() {
    this.displayModalBillingAddress = true;
  }

  setNewAddressBilling() {
    if (this.newAddressBilling.id != undefined) {
      this.addressService
        .updateAddress(this.newAddressBilling.id, this.newAddressBilling)
        .subscribe((res) => {
          this.connectedUser.billingAddress = this.newAddressBilling;

          this.storageCrypter.setItem(
            'user',
            JSON.stringify(this.connectedUser),
            'session'
          );

          this.iziToast.success({
            message: this.translate.instant('izitoast.modification_confirm'),
            position: 'topRight',
          });
          (
            document.getElementsByClassName(
              'billing-modal-close'
            )[0] as HTMLElement
          ).click();
        });
    } else {
      this.addressService
        .createAddress(this.newAddressBilling)
        .subscribe((res) => {
          this.connectedUser.billingAddress = res;

          this.storageCrypter.setItem(
            'user',
            JSON.stringify(this.connectedUser),
            'session'
          );
          this.us
            .updateUser(this.connectedUser?.id, this.connectedUser)
            .subscribe((res) => {
              this.iziToast.success({
                message: this.translate.instant(
                  'izitoast.modification_confirm'
                ),
                position: 'topRight',
              });
              (
                document.getElementsByClassName(
                  'billing-modal-close'
                )[0] as HTMLElement
              ).click();
            });
        });
    }
  }

  setNewAddressDelivery() {
    if (this.newAddressDelivery.id != undefined) {
      this.addressService
        .updateAddress(this.newAddressDelivery.id, this.newAddressDelivery)
        .subscribe((res) => {
          this.connectedUser.deliveryAddress = this.newAddressDelivery;

          this.storageCrypter.setItem(
            'user',
            JSON.stringify(this.connectedUser),
            'session'
          );

          this.iziToast.success({
            message: this.translate.instant('izitoast.modification_confirm'),
            position: 'topRight',
          });
          (
            document.getElementsByClassName(
              'delivery-modal-close'
            )[0] as HTMLElement
          ).click();
        });
    } else {
      this.addressService
        .createAddress(this.newAddressDelivery)
        .subscribe((res) => {
          this.connectedUser.deliveryAddress = res;

          this.storageCrypter.setItem(
            'user',
            JSON.stringify(this.connectedUser),
            'session'
          );
          this.us
            .updateUser(this.connectedUser?.id, this.connectedUser)
            .subscribe((res) => {
              this.iziToast.success({
                message: this.translate.instant(
                  'izitoast.modification_confirm'
                ),
                position: 'topRight',
              });
              (
                document.getElementsByClassName(
                  'delivery-modal-close'
                )[0] as HTMLElement
              ).click();
            });
        });
    }
  }

  checkOut() {
    if (this.connectedUser.id) {
      this.errorStock = false;
      this.cart.forEach((aBook) => {
        if (aBook.id && !this.errorStock) {
          this.bs.getOneBook(aBook.id).subscribe((el) => {
            if (aBook.number_ordered && el.stock) {
              if (aBook.number_ordered > el.stock) {
                this.errorStock = true;
                aBook.stock = el.stock;
                this.iziToast.error({
                  title: this.translate.instant('izitoast.lack_of_stock'),
                  message: this.translate.instant(
                    'izitoast.lack_of_stock_message',
                    {
                      bookStock: el.stock,
                      bookTitle: aBook.title,
                      bookNumber: aBook.number_ordered,
                    }
                  ),
                });
              }
            }
          });
        }
      });
      if (!this.errorStock) {
        this.cart.forEach((aBook) => {
          if (aBook.id) {
            if (aBook.stock && aBook.number_ordered && aBook.soldnumber) {
              aBook.stock -= aBook.number_ordered;
              aBook.soldnumber += aBook.number_ordered;

              this.bs.updateBook(aBook.id, aBook).subscribe((el) => {});
            }
          }
        });
        this.order.user = this.connectedUser;

        this.order.booklist = this.cart;
        this.order.totalpricettc = this.cartTotalPriceTtc;
        this.order.totalpriceht = this.cartTotalPriceHt;
        this.order.date = new Date();
        this.order.deliveryaddress =
          this.newAddressDelivery.street +
          ', ' +
          this.newAddressDelivery.postalcode +
          ' ' +
          this.newAddressDelivery.city +
          ', ' +
          this.newAddressDelivery.country;
        this.order.billingaddress =
          this.newAddressBilling.street +
          ', ' +
          this.newAddressBilling.postalcode +
          ' ' +
          this.newAddressBilling.city +
          ', ' +
          this.newAddressBilling.country;

        this.os.setOrder(this.order).subscribe((el) => {});
        this.cart = [];
        this.storageCrypter.removeItem('cart', 'local');
        this.iziToast.success({
          message: this.translate.instant('izitoast.your_order_is_validate'),
          position: 'topRight',
        });
        this.router.navigateByUrl('/home');
      }
    } else {
      this.iziToast.warning({
        message: this.translate.instant(
          'izitoast.login_before_confirm_check_out'
        ),
        position: 'topRight',
      });
      this.router.navigateByUrl('/my-account');
    }
  }
}
