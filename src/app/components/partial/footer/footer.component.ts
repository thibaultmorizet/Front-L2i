import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  path: string = '';
  flagimg: string =
    'https://back-l2i.thibaultmorizet.fr/assets/flag/englishFlag.png';
  language: string = 'en';
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private us: UserService
  ) {}

  ngOnInit(): void {
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = {};
    }
    try {
      this.translate.setDefaultLang(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).language
      );
      this.language = this.translate.getDefaultLang();
    } catch (error) {
      if (this.connectedUser.id == undefined) {
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
        'https://back-l2i.thibaultmorizet.fr/assets/flag/frenchFlag.png';
      this.translate.setDefaultLang(this.language);
      this.translate.use(this.language);
      return;
    }
    this.language = 'en';
    this.flagimg =
      'https://back-l2i.thibaultmorizet.fr/assets/flag/englishFlag.png';
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
  }

  changeLanguage() {
    console.log(this.language);
    if (this.language == 'en') {
      this.language = 'fr';
      this.setLanguage();
      if (this.connectedUser.id != undefined) {
        this.connectedUser.language = this.language;
      }
    } else {
      this.language = 'en';

      this.setLanguage();
      if (this.connectedUser.id != undefined) {
        this.connectedUser.language = this.language;
      }
    }

    if (this.connectedUser.id != undefined) {
      this.us
        .updateUser(this.connectedUser.id, this.connectedUser)
        .subscribe((user) => {
          this.storageCrypter.setItem(
            'user',
            JSON.stringify(this.connectedUser),
            'session'
          );
        });
      return;
    }
    this.storageCrypter.setItem('language', this.language, 'session');
  }
}
