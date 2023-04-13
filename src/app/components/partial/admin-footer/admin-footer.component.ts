import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {User} from 'src/app/interfaces/user';
import {UserService} from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.css'],
})
export class AdminFooterComponent implements OnInit {
  path: string = '';
  flagimg: string =
    'https://www.thibaultmorizet.fr/assets/flag/englishFlag.png';
  language: string = 'en';
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private us: UserService
  ) {
  }

  ngOnInit(): void {
    try {
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = {};
    }
    try {
      this.translate.setDefaultLang(
        JSON.parse(this.storageCrypter.getItem('adminUser', 'session')).language
      );
      this.language = this.translate.getDefaultLang();
    } catch (error) {
      if (this.connectedAdmin.id == undefined) {
        this.language = this.storageCrypter.getItem('language', 'session');
      }
      if (this.language == '') {
        this.language = 'en';
        this.translate.setDefaultLang('en');
      }
      if (this.language != '') {
        this.translate.setDefaultLang(this.language);
      }
    }

    this.translate.use(this.translate.getDefaultLang());
    this.setLanguage();
    this.activatedRoute.url.subscribe((el) => {
      this.path = el[0].path;
    });
  }

  setLanguage() {
    if (this.language == 'fr') {
      this.flagimg =
        'https://www.thibaultmorizet.fr/assets/flag/frenchFlag.png';
      this.translate.setDefaultLang(this.language);
      this.translate.use(this.language);
      return;
    }
    this.language = 'en';
    this.flagimg = 'https://www.thibaultmorizet.fr/assets/flag/englishFlag.png';
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
  }

  changeLanguage() {
    if (this.language == 'en') {
      this.language = 'fr';
      this.setLanguage();
      if (this.connectedAdmin.id != undefined) {
        this.connectedAdmin.language = this.language;
      }
    } else {
      this.language = 'en';

      this.setLanguage();
      if (this.connectedAdmin.id != undefined) {
        this.connectedAdmin.language = this.language;
      }
    }

    if (this.connectedAdmin.id != undefined) {
      this.us
        .updateUser(this.connectedAdmin.id, this.connectedAdmin)
        .subscribe((user) => {
          this.storageCrypter.setItem(
            'adminUser',
            JSON.stringify(this.connectedAdmin),
            'session'
          );
        });
      return;
    }
    this.storageCrypter.setItem('language', this.language, 'session');
  }
}
