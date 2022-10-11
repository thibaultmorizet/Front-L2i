import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { Book } from 'src/app/interfaces/book';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: [
    './my-account.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class MyAccountComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];
  connectedUser: User | null = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private us: UserService
  ) {}

  ngOnInit(): void {
    try {
      this.getUserByEmail(JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      ).email)
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
    }
  }
  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      console.log(res[0]);
      
      this.connectedUser = res[0];
    });
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }
}
