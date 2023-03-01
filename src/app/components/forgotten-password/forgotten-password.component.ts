import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { Product } from 'src/app/interfaces/product';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
})
export class ForgottenPasswordComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  cart: Array<Product> = [];
  emailToReset: string = '';

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService,
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService,
    private as: AuthService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  sendNewPassword() {
    this.us.getTheUser(this.emailToReset).subscribe((user) => {
      if (user[0] == undefined) {
        this.iziToast.warning({
          message: "This account doesn't exist",
          position: 'topRight',
        });
      } else {
        const alpha = 'abcdefghijklmnopqrstuvwxyz';
        const calpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const num = '1234567890';
        const specials = ',.!@#$%^&*';
        const options = [
          alpha,
          alpha,
          alpha,
          calpha,
          calpha,
          num,
          num,
          specials,
        ];
        let mailInfo = {
          userMail: this.emailToReset,
          subject: 'Votre nouveau mot de passe',
          html: 'reset_password.twig.html',
          password: '',
        };
        let opt, choose;
        let pass = '';
        for (let i = 0; i < 8; i++) {
          opt = Math.floor(Math.random() * options.length);
          choose = Math.floor(Math.random() * options[opt].length);
          pass = pass + options[opt][choose];
          options.splice(opt, 1);
        }
        mailInfo.password = pass;
        user[0].password = pass;
        this.as.sendNewPassword(mailInfo).subscribe((el) => {
          user[0].forceToUpdatePassword = true;
          this.us.updateUser(user[0].id, user[0]).subscribe();
          this.emailToReset = '';
          this.iziToast.success({
            message:
              'Your new password has just been sent to you by email, check your spam.',
            position: 'topRight',
          });
          this.router.navigateByUrl('/login');
        });
      }
    });
  }
}
