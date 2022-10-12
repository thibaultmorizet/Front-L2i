import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { Book } from 'src/app/interfaces/book';
import { UserService } from 'src/app/services/user.service';
import { Address } from 'src/app/interfaces/address';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: [
    './my-account.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class MyAccountComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];
  connectedUser: User | null = {};
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
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    try {
      this.getUserByEmail(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).email
      );
      this.newUserData.id = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      ).id;      
      this.newAddressBilling.id = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      ).billing_address.id;
      this.newAddressDelivery.id = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      ).delivery_address.id;
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
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
    if (this.newUserData.password == this.newUserData.passwordConfirm) {
      this.errorPassword = '';
      this.us
        .updateUser(this.newUserData.id, this.newUserData)
        .subscribe((res) => {
          this.newUserData = {};
          this.newUserData.id = this.connectedUser?.id;
          this.ngOnInit();
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });          
        });
    } else {
      this.errorPassword = 'Les mots de passes ne sont pas identiques';
    }
    console.log(this.connectedUser);
    
  }
  setNewAddressBilling() {
    this.addressService
      .updateAddress(this.newAddressBilling.id, this.newAddressBilling)
      .subscribe((res) => {
        this.newAddressBilling = {};
        this.newAddressBilling.id = this.connectedUser?.billing_address?.id;
        this.ngOnInit();
        this.iziToast.success({
          message: 'Modification réussie',
          position: 'topRight',
        });
      });
  }

  setNewAddressDelivery() {    
    this.addressService
      .updateAddress(this.newAddressDelivery.id, this.newAddressDelivery)
      .subscribe((res) => {
        this.newAddressDelivery = {};
        this.newAddressDelivery.id = this.connectedUser?.delivery_address?.id;
        this.ngOnInit();
        this.iziToast.success({
          message: 'Modification réussie',
          position: 'topRight',
        });
      });
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
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }
}
