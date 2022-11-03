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
import { DialogModule } from 'primeng/dialog';
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

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private authService: SocialAuthService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private addressService: AddressService,
    private us: UserService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

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
        this.iziToast.warning({
          title: 'Error in load of billing address',
          message: 'Reload the page',
          position: 'topRight',
        });
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
        this.iziToast.warning({
          title: 'Error in load of delivery address',
          message: 'Reload the page',
          position: 'topRight',
        });
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
    this.authService.signOut();
    this.connectedUser = {};
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
    const monthNames = [
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

    deliveryDate.setDate(deliveryDate.getDate() + deliveryDelai);

    this.deliveryDate =
      ' ' + monthNames[deliveryDate.getMonth()] + ' ' + deliveryDate.getDate();
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
            message: 'Modification confirm',
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
                message: 'Modification confirm',
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
            message: 'Modification confirm',
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
                message: 'Modification confirm',
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
}
