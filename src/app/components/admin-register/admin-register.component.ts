import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: [
    './admin-register.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class AdminRegisterComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  userInscription: User = { roles: ['ROLE_ADMIN'] };
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  basket: Array<Book> = [];

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private as: AuthService,
    private authService: SocialAuthService
  ) {
    document.body.style.backgroundColor = '#fff';
    document.body.style.backgroundImage = '';
  }

  ngOnInit(): void {
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
    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.refreshToken();
      }
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
  }

  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      this.storageCrypter.setItem('user', JSON.stringify(res[0]), 'session');
      this.connectedUser = res[0];
      if (!this.connectedUser?.roles?.includes('ROLE_ADMIN')) {
        this.iziToast.warning({
          message: 'Accès impossible si vous nêtes pas admin',
          position: 'topRight',
        });
        this.router.navigateByUrl('/books');
      }
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  adminRegister() {
    if (this.userInscription.password == this.userInscription.passwordConfirm) {
      this.errorPassword = '';

      this.us.getTheUser(this.userInscription.email).subscribe((res) => {
        if (res[0] == undefined) {
          this.errorEmail = '';

          this.us.register(this.userInscription).subscribe((resRegister) => {
            this.userInscription = { roles: ['ROLE_ADMIN'] };
            this.iziToast.success({
              message: 'Inscription du nouvel admin réussie',
              position: 'topRight',
            });
            this.router.navigateByUrl('/my-account');
          });
        } else {
          this.errorEmail = 'Cet email est déjà utilisé';
        }
      });
    } else {
      this.errorPassword = 'Les mots de passes ne sont pas identiques';
    }
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
