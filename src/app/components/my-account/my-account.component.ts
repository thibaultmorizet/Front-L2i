import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { Book } from 'src/app/interfaces/book';
import { UserService } from 'src/app/services/user.service';
import { Address } from 'src/app/interfaces/address';
import { AddressService } from 'src/app/services/address.service';
import { AuthService } from 'src/app/services/auth.service';
import { PrimeNGConfig, ConfirmationService } from 'primeng/api';
import { FormControl, Validators } from '@angular/forms';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/interfaces/order';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
})
export class MyAccountComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  cart: Array<Book> = [];
  connectedUser: User = {};
  newUserData: User = {};
  newAddressBilling: Address = {};
  newAddressDelivery: Address = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  errorLastname: string | null = null;
  errorFirstname: string | null = null;
  errorPasswordConfirm: string | null = null;
  orders: Array<Order> = [];
  isOrderPage: boolean = false;
  passwordIsClear: boolean = false;
  passwordType: string = 'password';

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private addressService: AddressService,
    private as: AuthService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
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
      this.newUserData = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
      delete this.newUserData.password;
      delete this.newUserData.passwordConfirm;
      delete this.newUserData.roles;
      delete this.newUserData.orders;
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
      try {
        this.os.getUserOrders(this.connectedUser.id).subscribe((el) => {
          this.orders = el;
        });
      } catch (error) {}
    }

    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }

    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      }
    }
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  setNewPersonnalData() {
    if (this.newUserData.token == null) {
      if (this.newUserData.password == '') {
        delete this.newUserData.password;
        delete this.newUserData.passwordConfirm;
      }
      if (this.newUserData.password == this.newUserData.passwordConfirm) {
        this.errorPassword = null;
        this.us
          .updateUser(this.newUserData.id, this.newUserData)
          .subscribe((res) => {
            this.iziToast.success({
              message: this.translate.instant('izitoast.modification_confirm'),
              position: 'topRight',
            });
            delete this.newUserData.password;
            delete this.newUserData.passwordConfirm;
            this.connectedUser = this.newUserData;
            this.storageCrypter.setItem(
              'user',
              JSON.stringify(this.connectedUser),
              'session'
            );
          });
      } else {
        this.errorPassword = "The password isn't identical";
      }
    }
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
            });
        });
    }
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedUser = {};
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
    this.router.navigateByUrl('/home');
  }

  tooglePasswordClear() {
    this.passwordIsClear = !this.passwordIsClear;
    if (this.passwordIsClear) {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

  checkUpdatePasswordPattern() {
    let passwordPattern = new FormControl(
      this.newUserData.password,
      Validators.pattern(
        '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[-+!*$@%_])([-+!*$@%_\\w]{8,255})'
      )
    );
    if (passwordPattern.status == 'INVALID') {
      this.errorPassword =
        'The password must contain at least 8 characters, one capital letter, one lowercase letter, one special character and one numeric character';
    } else {
      this.errorPassword = null;
    }
  }

  checkUpdatePasswordConfirmPattern() {
    if (this.newUserData.password != this.newUserData.passwordConfirm) {
      this.errorPassword = 'The passwords must be identical';
      this.errorPasswordConfirm = 'The passwords must be identical';
    } else {
      this.errorPasswordConfirm = null;
      this.checkUpdatePasswordPattern();
    }
  }
  confirmDeleteAccount() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'my_account.are_you_sure_that_you_want_delete_your_account'
      ),
      header: this.translate.instant('my_account.delete_my_account'),
      dismissableMask: true,
      accept: () => {
        this.deleteMyAccount();
      },
    });
  }
  deleteMyAccount() {
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
      this.addressService
        .deleteTheAddress(this.connectedUser.billingAddress?.id)
        .subscribe((el) => {});
      this.addressService
        .deleteTheAddress(this.connectedUser.deliveryAddress?.id)
        .subscribe((el) => {});
      this.us.deleteTheUser(this.connectedUser.id).subscribe((el) => {});
      this.logout();
    } catch {}
  }
  replaceInAddress(address: string | undefined) {
    if (address) {
      address = address.replace(', ', '<br>');
      return address.replace(', ', '<br>');
    } else {
      return false;
    }
  }
  getOrderDate(orderDate: Date | undefined) {
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

    if (orderDate) {
      orderDate = new Date(orderDate);
      if (this.translate.getDefaultLang() == 'fr') {
        return (
          orderDate.getDate() +
          ' ' +
          frenchMonthNames[orderDate.getMonth()] +
          ' ' +
          orderDate.getFullYear()
        );
      } else {
        return (
          orderDate.getDate() +
          ' ' +
          englishMonthNames[orderDate.getMonth()] +
          ' ' +
          orderDate.getFullYear()
        );
      }
    } else {
      return false;
    }
  }
}
