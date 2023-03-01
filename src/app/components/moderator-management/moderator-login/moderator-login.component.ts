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
  selector: 'app-moderator-login',
  templateUrl: './moderator-login.component.html',
  styleUrls: ['./moderator-login.component.css', './../../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModeratorLoginComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  passwordIsClear: boolean = false;
  passwordType: string = 'password';
  moderatorLogin: User = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedModerator: User = {};

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
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('language', 'session');

    try {
      this.connectedModerator = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
    } catch (error) {
      this.connectedModerator = {};
    }
    if (this.connectedModerator.id) {
      this.router.navigateByUrl('/moderator/home');
    }
  }

  tooglePasswordClear() {
    this.passwordIsClear = !this.passwordIsClear;
    if (this.passwordIsClear) {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

  login() {
    this.us.getTheUser(this.moderatorLogin.email).subscribe((theUser) => {
      if (theUser[0] == undefined) {
        this.errorEmail = 'We did not find an account with this email address';
      } else if (!theUser[0].roles?.includes('ROLE_MODERATOR')) {
        this.iziToast.error({
          message: this.translate.instant(
            'izitoast.you_can_t_connect_here_as_user_or_admin'
          ),
          position: 'topRight',
        });
      } else {
        this.errorEmail = null;
        this.as.login(this.moderatorLogin).subscribe({
          next: (res) => {
            if (res.token != null) {
              this.storageCrypter.setItem('jeton', res.token, 'local');

              this.storageCrypter.setItem(
                'moderatorUser',
                JSON.stringify(theUser[0]),
                'session'
              );

              this.connectedModerator = theUser[0];
              this.errorPassword = null;
              try {
                this.translate.setDefaultLang(
                  this.connectedModerator.language != undefined
                    ? this.connectedModerator.language
                    : ''
                );
              } catch (error) {
                this.translate.setDefaultLang('en');
              }
              this.moderatorLogin = {};
              this.iziToast.success({
                message: this.translate.instant('izitoast.successful_login'),
                position: 'topRight',
              });
              setTimeout(() => {
                this.router.navigateByUrl('/moderator/home');
              }, 250);
            }
          },
          error: (res) => {
            this.errorPassword = 'Incorrect password';
          },
        });
      }
    });
  }
}
