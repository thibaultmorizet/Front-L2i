import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  FacebookLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { Book } from 'src/app/interfaces/book';
import { User } from 'src/app/interfaces/user';
import { AddressService } from 'src/app/services/address.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
})
export class LoginComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  cart: Array<Book> = [];
  connectedUser: User = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  errorLastname: string | null = null;
  errorFirstname: string | null = null;
  errorPasswordConfirm: string | null = null;
  loginAfterRegister: boolean = false;
  userLogin: User = {};
  isLoginPage: boolean = true;
  userInscription: User = {};
  passwordIsClear: boolean = false;
  passwordType: string = 'password';

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private as: AuthService,
    private authService: SocialAuthService,
    private primengConfig: PrimeNGConfig,
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

    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }

    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      }
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.authService.signOut();
    this.connectedUser = {};
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
    this.router.navigateByUrl('/home');
  }

  login() {
    this.as.getTheUser(this.userLogin.email).subscribe((theUser) => {
      if (theUser[0] == undefined) {
        this.errorEmail = 'We did not find an account with this email address';
      } else if (theUser[0].roles?.includes('ROLE_ADMIN')) {
        this.iziToast.error({
          message: "you can't connect here as admin",
          position: 'topRight',
        });
      } else {
        if (theUser[0].token == null || this.loginAfterRegister) {
          this.errorEmail = null;
          this.as.login(this.userLogin).subscribe({
            next: (res) => {
              if (res.token != null) {
                this.storageCrypter.setItem('jeton', res.token, 'local');

                this.storageCrypter.setItem(
                  'user',
                  JSON.stringify(theUser[0]),
                  'session'
                );

                this.connectedUser = theUser[0];
                this.errorPassword = null;
                try {
                  this.translate.setDefaultLang(
                    this.connectedUser.language != undefined
                      ? this.connectedUser.language
                      : ''
                  );
                } catch (error) {
                  this.translate.setDefaultLang('en');
                }
                this.userLogin = {};
                this.iziToast.success({
                  message: this.translate.instant('izitoast.successful_login'),
                  position: 'topRight',
                });
                setTimeout(() => {
                  this.router.navigateByUrl('/home');
                }, 250);
              }
            },
            error: (res) => {
              this.errorPassword = 'Incorrect password';
            },
          });
        }
      }
    });
    this.loginAfterRegister = false;
  }
  register() {
    this.as.getTheUser(this.userInscription.email).subscribe((res) => {
      if (res[0] == undefined) {
        this.errorEmail = '';
        this.userInscription.language = 'en';
        this.us.register(this.userInscription).subscribe((resRegister) => {
          this.userInscription = {};
          this.isLoginPage = true;

          if (this.loginAfterRegister) {
            this.login();
          } else {
            this.iziToast.success({
              message: this.translate.instant(
                'izitoast.successful_registration'
              ),
              position: 'topRight',
            });
            this.router.navigateByUrl('/home');
          }
        });
      } else {
        this.errorEmail = 'This email has already been registered';
      }
    });
  }
  signInWithGoogle(): void {
    /*  this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((data) => console.log(data));
    console.log(this.authService); */
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data) => {
      if (this.isLoggedin) {
        this.us.getTheUser(this.socialUser.email).subscribe((el) => {
          this.loginAfterRegister = true;

          if (el[0] != undefined) {
            if (el[0].token == data.id) {
              this.userLogin.email = el[0].email;
              this.userLogin.password = el[0].token;
              this.userLogin.passwordConfirm = el[0].token;
              this.login();
              this.userLogin = {};
            } else {
              this.loginAfterRegister = false;
              this.authService.signOut();
              this.iziToast.success({
                message: 'this email is already use',
                position: 'topRight',
              });
            }
          } else {
            this.userInscription = {};
            this.userInscription.email = this.socialUser.email;
            this.userInscription.lastname = this.socialUser.lastName;
            this.userInscription.firstname = this.socialUser.firstName;
            this.userInscription.password = this.socialUser.id;
            this.userInscription.token = this.socialUser.id;
            this.userLogin.email = this.socialUser.email;
            this.userLogin.password = this.socialUser.id;
            this.register();
          }
        });
      }
    });
  }
  toggleIsLoginPage() {
    this.isLoginPage = !this.isLoginPage;
    this.userInscription = {};
    this.userLogin = {};
    this.errorEmail = null;
    this.errorFirstname = null;
    this.errorLastname = null;
    this.errorPassword = null;
    this.errorPasswordConfirm = null;
  }
  tooglePasswordClear() {
    this.passwordIsClear = !this.passwordIsClear;
    if (this.passwordIsClear) {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }
  checkLastnamePattern() {
    let lastnamePattern = new FormControl(
      this.userInscription.lastname,
      Validators.pattern('[a-zA-Z- ]{3,255}')
    );
    if (lastnamePattern.status == 'INVALID') {
      this.errorLastname =
        'The lastname must contain at least three characters';
    } else {
      this.errorLastname = null;
    }
  }

  checkFirstnamePattern() {
    let firstnamePattern = new FormControl(
      this.userInscription.firstname,
      Validators.pattern('[a-zA-Z- ]{3,255}')
    );
    if (firstnamePattern.status == 'INVALID') {
      this.errorFirstname =
        'The firstname must contain at least three characters';
    } else {
      this.errorFirstname = null;
    }
  }

  checkEmailPattern() {
    let emailPattern = new FormControl(
      this.userInscription.email,
      Validators.pattern('[a-zA-Z-0-9]+@[a-zA-Z-]+.[a-zA-Z]{2,6}')
    );
    if (emailPattern.status == 'INVALID') {
      this.errorEmail = "The Email isn't valid";
    } else {
      this.errorEmail = null;
    }
  }

  checkPasswordPattern() {
    let passwordPattern = new FormControl(
      this.userInscription.password,
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

  checkPasswordConfirmPattern() {
    if (this.userInscription.password != this.userInscription.passwordConfirm) {
      this.errorPassword = 'The passwords must be identical';
      this.errorPasswordConfirm = 'The passwords must be identical';
    } else {
      this.errorPasswordConfirm = null;
      this.checkPasswordPattern();
    }
  }
}
