import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-admin-admins',
  templateUrl: './admin-admins.component.html',
  styleUrls: ['./admin-admins.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminAdminsComponent implements OnInit {
  userDialog: boolean = false;
  allUsers: any = [];
  user: User = {};
  selectedUsers: User[] = [];
  submitted: boolean = false;

  constructor(
    private us: UserService,
    private primengConfig: PrimeNGConfig,
    private iziToast: NgxIzitoastService,
    private as: AuthService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.us.getAllAdminsUsers().then((data) => {
      this.allUsers = data;
    });
    this.submitted = false;
  }

  openNew() {
    this.user = {};
    this.submitted = false;
    this.userDialog = true;
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser() {
    this.submitted = true;
    const user = this.user;

    if (!user.id) {
      this.us.getTheUser(user.email).subscribe((res) => {
        if (res[0] == undefined) {
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
            userMail: user.email,
            subject: 'Votre nouveau mot de passe',
            html: 'activation.twig.html',
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
          user.password = pass;
          user.passwordConfirm = pass;
          user.language = 'en';
          user.roles = ['ROLE_ADMIN'];
          mailInfo.password = pass;
          this.as.sendNewPassword(mailInfo).subscribe((el) => {});
          this.us.register(user).subscribe((result) => {
            this.as.getTheUser(user.email).subscribe((userRes) => {
              this.allUsers.push(user);

              this.ngOnInit();
              pass = '';
              this.iziToast.success({
                message: 'User created',
                position: 'topRight',
              });
            });
          });
        } else {
          this.iziToast.error({
            message: 'This email is already use',
            position: 'topRight',
          });
        }
      });
    }

    this.allUsers = [...this.allUsers];
    this.userDialog = false;
    this.user = {};
  }
}
