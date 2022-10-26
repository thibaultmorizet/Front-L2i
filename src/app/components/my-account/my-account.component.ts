import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { Book } from 'src/app/interfaces/book';
import { UserService } from 'src/app/services/user.service';
import { Address } from 'src/app/interfaces/address';
import { AddressService } from 'src/app/services/address.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: [
    './my-account.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
    './../../../css/footer.css',
  ],
})
export class MyAccountComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];
  connectedUser: User = {};
  newUserData: User = {};
  newAddressBilling: Address = {};
  newAddressDelivery: Address = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private addressService: AddressService,
    private as: AuthService
  ) {}

  ngOnInit(): void {
    try {
      this.getUserByEmail(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).email
      );
      this.newUserData.id = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      ).id;
    } catch (error) {
      this.connectedUser = {};
    }

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
        title: "Erreur de chargement de l'addresse de facturation",
        message: 'Veuillez recharger la page',
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
        title: "Erreur de chargement de l'addresse de livraison",
        message: 'Veuillez recharger la page',
        position: 'topRight',
      });
    }

    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
    }
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

  setNewPersonnalData() {
    if (this.newUserData.password == this.newUserData.passwordConfirm) {
      this.errorPassword = '';
      this.us
        .updateUser(this.newUserData.id, this.newUserData)
        .subscribe((res) => {
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });
        });
    } else {
      this.errorPassword = 'Les mots de passes ne sont pas identiques';
    }
  }

  setNewAddressBilling() {
    if (this.newAddressBilling.id != undefined) {
      this.addressService
        .updateAddress(this.newAddressBilling.id, this.newAddressBilling)
        .subscribe((res) => {
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });
        });
    } else {
      this.addressService
        .createAddress(this.newAddressBilling)
        .subscribe((res) => {
          this.connectedUser.billingAddress = res;

          this.us
            .updateUser(this.connectedUser?.id, this.connectedUser)
            .subscribe((res) => {
              this.iziToast.success({
                message: 'Modification réussie',
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
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });
        });
    } else {
      this.addressService
        .createAddress(this.newAddressDelivery)
        .subscribe((res) => {
          this.connectedUser.deliveryAddress = res;

          this.us
            .updateUser(this.connectedUser?.id, this.connectedUser)
            .subscribe((res) => {
              this.iziToast.success({
                message: 'Modification réussie',
                position: 'topRight',
              });
            });
        });
    }
  }

  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      this.storageCrypter.setItem('user', JSON.stringify(res[0]), 'session');
      this.connectedUser = res[0];
    });
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.connectedUser = {};
    this.router.navigateByUrl('/books');
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
