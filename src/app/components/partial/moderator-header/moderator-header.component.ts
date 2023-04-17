import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { User } from 'src/app/interfaces/user';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-moderator-header',
  templateUrl: './moderator-header.component.html',
  styleUrls: ['./moderator-header.component.css'],
})
export class ModeratorHeaderComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedModerator: User = {};
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
      this.connectedModerator = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
    } catch (error) {
      this.connectedModerator = {};
    }

    if (this.connectedModerator?.id && this.connectedModerator.forceToUpdatePassword) {
      this.router.navigateByUrl('/moderator/account');
      setTimeout(() => {
        if (this.path != 'moderator/account/') {
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
