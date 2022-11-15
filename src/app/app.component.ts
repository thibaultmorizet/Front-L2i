import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  title = 'L2i';

  constructor(private translate: TranslateService) {}
  ngOnInit(): void {
    try {
      this.translate.setDefaultLang(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).language
      );
    } catch (error) {
      this.translate.setDefaultLang('en');
    }
  }
}
