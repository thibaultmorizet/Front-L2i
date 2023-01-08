import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SocialAuthService } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-moderator-account',
  templateUrl: './moderator-account.component.html',
  styleUrls: [
    './moderator-account.component.css',
    './../../../../css/main.css',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
})
export class ModeratorAccountComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedModerator: User = {};
  newModeratorData: User = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  errorLastname: string | null = null;
  errorFirstname: string | null = null;
  errorPasswordConfirm: string | null = null;
  passwordIsClear: boolean = false;
  passwordType: string = 'password';
  forceToUpdatePassword: boolean = false;

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private authService: SocialAuthService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    try {
      this.connectedModerator = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
      this.newModeratorData = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
      delete this.newModeratorData.password;
      delete this.newModeratorData.passwordConfirm;
      delete this.newModeratorData.roles;
      delete this.newModeratorData.orders;
    } catch (error) {
      this.connectedModerator = {};
    }
    if (this.connectedModerator?.id && this.connectedModerator.forceToUpdatePassword) {
      this.forceToUpdatePassword = true;
    } else {
      this.forceToUpdatePassword = false;
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
    if (this.newModeratorData.token == null) {
      if (this.newModeratorData.password == '') {
        delete this.newModeratorData.password;
        delete this.newModeratorData.passwordConfirm;
      }
      if (this.newModeratorData.password == this.newModeratorData.passwordConfirm) {
        this.errorPassword = null;
        this.newModeratorData.forceToUpdatePassword = false;
        this.us
          .updateUser(this.newModeratorData.id, this.newModeratorData)
          .subscribe((res) => {
            this.forceToUpdatePassword = false;
            this.iziToast.success({
              message: this.translate.instant(
                'izitoast.modification_confirmed'
              ),
              position: 'topRight',
            });
            delete this.newModeratorData.password;
            delete this.newModeratorData.passwordConfirm;
            this.connectedModerator = this.newModeratorData;
            this.storageCrypter.setItem(
              'moderatorUser',
              JSON.stringify(this.connectedModerator),
              'session'
            );
          });
      } else {
        this.errorPassword = 'The passwords must be identical';
      }
    }
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedModerator = {};
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
    this.router.navigateByUrl('/moderator/home');
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
      this.newModeratorData.password,
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
    if (this.newModeratorData.password != this.newModeratorData.passwordConfirm) {
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
      this.connectedModerator = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
      this.us.deleteTheUser(this.connectedModerator.id).subscribe((el) => {});
      this.logout();
    } catch {}
  }
}
