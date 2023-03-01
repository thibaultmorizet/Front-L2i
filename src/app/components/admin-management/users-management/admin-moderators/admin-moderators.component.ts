import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-moderators',
  templateUrl: './admin-moderators.component.html',
  styleUrls: ['./admin-moderators.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminModeratorsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  moderatorDialog: boolean = false;
  allModerators: any = [];
  moderator: User = {};
  selectedModerators: User[] = [];
  submitted: boolean = false;

  constructor(
    private router: Router,
    private us: UserService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    try {
      JSON.parse(this.storageCrypter.getItem('adminUser', 'session'));
    } catch (error) {
      this.router.navigateByUrl('/admin/login');
    }
    this.us.getAllModeratorsUsers().then((data) => {
      this.allModerators = data;
    });
    this.submitted = false;
  }

  openNew() {
    this.moderator = {};
    this.submitted = false;
    this.moderatorDialog = true;
  }

  deleteSelectedModerators() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_moderators.confirm_group_delete_moderators_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allModerators = this.allModerators.filter(
          (val: any) => !this.selectedModerators.includes(val)
        );
        this.selectedModerators.forEach((aModerator) => {
          this.us.deleteTheUser(aModerator.id).subscribe((el) => {});
        });
        this.selectedModerators = [];
        this.iziToast.success({
          message: this.translate.instant('admin_moderators.moderators_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  deleteModerator(moderator: User) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_moderators.confirm_delete_moderator_message',
        { firstname: moderator.firstname, lastname: moderator.lastname }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allModerators = this.allModerators.filter((val: any) => val.id !== moderator.id);
        this.us.deleteTheUser(moderator.id).subscribe((el) => {});
        this.moderator = {};
        this.iziToast.success({
          message: this.translate.instant('admin_moderators.moderator_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editModerator(moderator: User) {
    this.moderator = { ...moderator };
    this.moderatorDialog = true;
  }

  hideDialog() {
    this.moderatorDialog = false;
    this.submitted = false;
  }

  saveModerator() {
    this.submitted = true;
    const moderator = this.moderator;

    if (moderator.id) {
      this.us.getTheUser(moderator.email).subscribe((res) => {
        if (
          res[0] == undefined ||
          (res[0] != undefined && res[0].id == moderator.id)
        ) {
          this.us.updateUser(moderator.id, moderator).subscribe((result) => {
            this.ngOnInit();
            this.iziToast.success({
              message: 'Moderator updated',
              position: 'topRight',
            });
          });
        } else {
          this.iziToast.error({
            message: this.translate.instant(
              'general.this_email_is_already_use'
            ),
            position: 'topRight',
          });
        }
      });
    } else {
      this.us.getTheUser(moderator.email).subscribe((res) => {
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
            userMail: moderator.email,
            subject: 'Votre nouveau mot de passe',
            html: 'activationModerator.twig.html',
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
          moderator.password = pass;
          moderator.passwordConfirm = pass;
          moderator.forceToUpdatePassword = true;
          moderator.language = 'en';
          moderator.roles = ['ROLE_MODERATOR'];
          mailInfo.password = pass;
          this.as.sendNewPassword(mailInfo).subscribe((el) => {});
          this.us.register(moderator).subscribe((result) => {
            this.us.getTheUser(moderator.email).subscribe((moderatorRes) => {
              this.allModerators.push(moderator);

              this.ngOnInit();
              pass = '';
              this.iziToast.success({
                message: this.translate.instant('admin_moderators.moderator_created'),
                position: 'topRight',
              });
            });
          });
        } else {
          this.iziToast.error({
            message: this.translate.instant(
              'general.this_email_is_already_use'
            ),
            position: 'topRight',
          });
        }
      });
    }

    this.allModerators = [...this.allModerators];
    this.moderatorDialog = false;
    this.moderator = {};
  }
}
