import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
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
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private us: UserService
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
  }
}
