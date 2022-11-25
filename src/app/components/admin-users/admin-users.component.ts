import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Address } from 'src/app/interfaces/address';
import { User } from 'src/app/interfaces/user';
import { AddressService } from 'src/app/services/address.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminUsersComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  userDialog: boolean = false;
  allUsers: any = [];
  user: User = {};
  selectedUsers: User[] = [];
  submitted: boolean = false;
  updateBillingAddress: Address = {};
  updateDeliveryAddress: Address = {};

  constructor(
    private router: Router,
    private us: UserService,
    private addressService: AddressService,
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
    this.us.getAllNotAdminsUsers().then((data) => {
      this.allUsers = data;
    });
    this.submitted = false;
  }

  openNew() {
    this.user = {};
    this.updateBillingAddress = {};
    this.updateDeliveryAddress = {};
    this.submitted = false;
    this.userDialog = true;
  }

  deleteSelectedUsers() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_users.confirm_group_delete_users_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allUsers = this.allUsers.filter(
          (val: any) => !this.selectedUsers.includes(val)
        );
        this.selectedUsers.forEach((anUser) => {
          this.us.deleteTheUser(anUser.id).subscribe((el) => {});
        });
        this.selectedUsers = [];
        this.iziToast.success({
          message: this.translate.instant('admin_users.users_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_users.confirm_delete_user_message',
        { firstname: user.firstname, lastname: user.lastname }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allUsers = this.allUsers.filter((val: any) => val.id !== user.id);
        this.us.deleteTheUser(user.id).subscribe((el) => {});
        this.user = {};
        this.iziToast.success({
          message: this.translate.instant('admin_users.user_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editUser(user: User) {
    this.user = { ...user };
    this.updateBillingAddress = { ...user.billingAddress };
    this.updateDeliveryAddress = { ...user.deliveryAddress };
    this.userDialog = true;
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser() {
    this.submitted = true;
    const user = this.user;
    const updateBillingAddress = this.updateBillingAddress;
    const updateDeliveryAddress = this.updateDeliveryAddress;

    if (user.id) {
      this.us.getTheUser(user.email).subscribe((res) => {
        if (
          res[0] == undefined ||
          (res[0] != undefined && res[0].id == user.id)
        ) {
          this.us.updateUser(user.id, user).subscribe((result) => {
            if (
              updateBillingAddress.street &&
              updateBillingAddress.postalcode &&
              updateBillingAddress.city &&
              updateBillingAddress.country
            ) {
              if (updateBillingAddress.id) {
                this.addressService
                  .updateAddress(updateBillingAddress.id, updateBillingAddress)
                  .subscribe();
              } else {
                this.addressService
                  .createAddress(updateBillingAddress)
                  .subscribe();
              }
            }
            if (
              updateDeliveryAddress.street &&
              updateDeliveryAddress.postalcode &&
              updateDeliveryAddress.city &&
              updateDeliveryAddress.country
            ) {
              if (updateDeliveryAddress.id) {
                this.addressService
                  .updateAddress(
                    updateDeliveryAddress.id,
                    updateDeliveryAddress
                  )
                  .subscribe();
              } else {
                this.addressService
                  .createAddress(updateDeliveryAddress)
                  .subscribe();
              }
            }
            this.ngOnInit();
            this.iziToast.success({
              message: 'User updated',
              position: 'topRight',
            });
          });
        } else {
          this.iziToast.error({
            message: this.translate.instant('general.this_email_is_already_use'),
            position: 'topRight',
          });
        }
      });
    } else {
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
          mailInfo.password = pass;
          this.as.sendNewPassword(mailInfo).subscribe((el) => {});
          this.us.register(user).subscribe((result) => {
            this.as.getTheUser(user.email).subscribe((userRes) => {
              if (
                updateBillingAddress.street &&
                updateBillingAddress.postalcode &&
                updateBillingAddress.city &&
                updateBillingAddress.country
              ) {
                this.addressService
                  .createAddress(updateBillingAddress)
                  .subscribe((updateBillingAddressResult) => {
                    user.billingAddress = updateBillingAddressResult;
                    this.us.updateUser(userRes[0].id, user).subscribe();
                  });
              }
              if (
                updateDeliveryAddress.street &&
                updateDeliveryAddress.postalcode &&
                updateDeliveryAddress.city &&
                updateDeliveryAddress.country
              ) {
                this.addressService
                  .createAddress(updateDeliveryAddress)
                  .subscribe((updateDeliveryAddressResult) => {
                    user.deliveryAddress = updateDeliveryAddressResult;
                    this.us.updateUser(userRes[0].id, user).subscribe();
                  });
              }
              this.allUsers.push(user);

              this.ngOnInit();
              pass = '';
              this.iziToast.success({
                message: this.translate.instant('admin_users.user_created'),
                position: 'topRight',
              });
            });
          });
        } else {
          this.iziToast.error({
            message: this.translate.instant('general.this_email_is_already_use'),
            position: 'topRight',
          });
        }
      });
    }

    this.allUsers = [...this.allUsers];
    this.userDialog = false;
    this.user = {};
    this.updateBillingAddress = {};
    this.updateDeliveryAddress = {};
  }
}
