import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { User } from 'src/app/interfaces/user';
import { BookService } from 'src/app/services/book.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminHomeComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  booksBestSell: Array<Book> = [];
  booksMoreVisited: Array<Book> = [];

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private bs: BookService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    try {
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = null;
      this.router.navigateByUrl('/admin/login');
    }

    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.adminLogout();
      }
    }
    this.getBooksBestSell();
    this.getBooksMoreVisited();
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  adminLogout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedAdmin = null;
    this.router.navigateByUrl('/admin/login');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }

  getBooksBestSell() {
    this.bs.getBooksBestSell().subscribe((res) => {
      this.booksBestSell = res;
    });
  }
  getBooksMoreVisited() {
    this.bs.getBooksMoreVisited().subscribe((res) => {
      console.log(res);
      
      this.booksMoreVisited = res;
    });
  }
}
