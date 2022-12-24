import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-legal-notices',
  templateUrl: './legal-notices.component.html',
  styleUrls: ['./legal-notices.component.css'],
})
export class LegalNoticesComponent implements OnInit {
  cart: Array<Product> = [];
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private as: AuthService,
    private authService: SocialAuthService,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());
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
  }
  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
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
}
