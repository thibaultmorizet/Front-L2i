import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-moderator-footer',
  templateUrl: './moderator-footer.component.html',
  styleUrls: ['./moderator-footer.component.css'],
})
export class ModeratorFooterComponent implements OnInit {
  path: string = '';
  flagimg: string =
    'https://back-l2i.thibaultmorizet.fr/assets/flag/englishFlag.png';
  language: string = 'en';
  storageCrypter = new StorageCrypter('Secret');
  connectedModerator: User = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private us: UserService
  ) {}

  ngOnInit(): void {
    try {
      this.connectedModerator = JSON.parse(
        this.storageCrypter.getItem('moderatorUser', 'session')
      );
    } catch (error) {
      this.connectedModerator = {};
    }
    try {
      this.translate.setDefaultLang(
        JSON.parse(this.storageCrypter.getItem('moderatorUser', 'session'))
          .language
      );
      this.language = this.translate.getDefaultLang();
    } catch (error) {
      if (this.connectedModerator.id == undefined) {
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
    if (this.language == 'en') {
      this.language = 'fr';
      this.setLanguage();
      if (this.connectedModerator.id != undefined) {
        this.connectedModerator.language = this.language;
      }
    }
    if (this.language == 'fr') {
      this.language = 'en';

      this.setLanguage();
      if (this.connectedModerator.id != undefined) {
        this.connectedModerator.language = this.language;
      }
    }

    if (this.connectedModerator.id != undefined) {
      this.us
        .updateUser(this.connectedModerator.id, this.connectedModerator)
        .subscribe((user) => {
          this.storageCrypter.setItem(
            'moderatorUser',
            JSON.stringify(this.connectedModerator),
            'session'
          );
        });
      return;
    }
    this.storageCrypter.setItem('language', this.language, 'session');
  }
}
