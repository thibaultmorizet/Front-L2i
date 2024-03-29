import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { PrimeNGConfig } from 'primeng/api';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css', './../../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLoginComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  passwordIsClear: boolean = false;
  typeOfPassword: string = 'password';
  adminLogin: User = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedAdmin: User = {};

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private us: UserService,
    private translate: TranslateService,
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    this.translate.use(this.translate.getDefaultLang());

    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');

    try {
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = {};
    }
    if (this.connectedAdmin.id) {
      this.router.navigateByUrl('/admin/home');
    }
  }

  tooglePasswordClear() {
    this.passwordIsClear = !this.passwordIsClear;
    if (this.passwordIsClear) {
      this.typeOfPassword = 'text';
      return;
    }
    this.typeOfPassword = 'password';
  }

  login() {
    this.us.getTheUser(this.adminLogin.email).subscribe((theUser) => {
      if (theUser[0] == undefined) {
        this.errorEmail = 'We did not find an account with this email address';
        return;
      }
      if (!theUser[0].roles?.includes('ROLE_ADMIN')) {
        this.iziToast.error({
          message: this.translate.instant(
            'izitoast.you_can_t_connect_here_as_user_or_moderator'
          ),
          position: 'topRight',
        });
        return;
      }

      this.errorEmail = null;
      this.as.login(this.adminLogin).subscribe({
        next: (res) => {
          if (res.token != null) {
            this.storageCrypter.setItem('jeton', res.token, 'local');

            this.storageCrypter.setItem(
              'adminUser',
              JSON.stringify(theUser[0]),
              'session'
            );

            this.connectedAdmin = theUser[0];
            this.errorPassword = null;
            try {
              this.translate.setDefaultLang(
                this.connectedAdmin.language != undefined
                  ? this.connectedAdmin.language
                  : ''
              );
            } catch (error) {
              this.translate.setDefaultLang('en');
            }
            this.adminLogin = {};
            this.iziToast.success({
              message: this.translate.instant('izitoast.successful_login'),
              position: 'topRight',
            });
            setTimeout(() => {
              this.router.navigateByUrl('/admin/home');
            }, 250);
          }
        },
        error: () => {
          this.errorPassword = 'Incorrect password';
        },
      });
    });
  }
}
