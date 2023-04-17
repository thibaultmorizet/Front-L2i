import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { User } from 'src/app/interfaces/user';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User = {};
  path: string = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());

    this.activatedRoute.url.subscribe((el) => {
      this.path = '';
      el.forEach((element) => {
        this.path += element.path + '/';
      });
    });

    try {
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = {};
    }

    if (this.connectedAdmin?.id && this.connectedAdmin.forceToUpdatePassword) {
      this.router.navigateByUrl('/admin/account');
      setTimeout(() => {
        if (this.path != 'admin/account/') {
          this.iziToast.warning({
            message: this.translate.instant(
              'general.please_change_your_password'
            ),
            position: 'topRight',
          });
        }
      }, 500);
    }
  }
}
