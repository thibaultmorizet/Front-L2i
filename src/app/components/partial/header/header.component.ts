import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import StorageCrypter from 'storage-crypter';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() cartLength: number = 0;
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
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
      this.path = el[0].path;
    });

    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.connectedUser?.id && this.connectedUser.forceToUpdatePassword) {
      this.router.navigateByUrl('my-account');
      setTimeout(() => {
        if (this.path != 'my-account') {
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
