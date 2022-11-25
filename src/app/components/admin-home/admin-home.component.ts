import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { DoughnutInfo } from 'src/app/interfaces/doughnut-info';
import { User } from 'src/app/interfaces/user';
import { BookService } from 'src/app/services/book.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css', './../../../css/main.css'],
})
export class AdminHomeComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  bestSellDoughnut: DoughnutInfo = {
    datasets: [{}],
  };
  moreVisitDoughnut: DoughnutInfo = {
    datasets: [{}],
  };

  bestSellOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Best sell',
      },
      legend: {
        position: 'right',
      },
    },
  };
  moreVisitedOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Best sell',
      },
      legend: {
        position: 'right',
      },
    },
  };
  
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
    this.getBestSellDoughnut();
    this.getMoreVisitDoughnut();
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


  getBestSellDoughnut() {
    this.bs.getBooksBestSell().subscribe((bestBooks) => {
      bestBooks.forEach((aBook) => {
        if (this.bestSellDoughnut.labels) {
          this.bestSellDoughnut.labels.push(aBook.title ?? '');
        } else {
          this.bestSellDoughnut.labels = [aBook.title ?? ''];
        }
        if (this.bestSellDoughnut.datasets) {
          if (this.bestSellDoughnut.datasets[0].data) {
            this.bestSellDoughnut.datasets[0].data.push(aBook.soldnumber ?? 0);
          } else {
            this.bestSellDoughnut.datasets[0].data = [aBook.soldnumber ?? 0];
          }
        }
      });
    });
  }
  getMoreVisitDoughnut() {
    this.bs.getBooksMoreVisited().subscribe((moreVisitedBooks) => {
      moreVisitedBooks.forEach((aBook) => {
        if (this.moreVisitDoughnut.labels) {
          this.moreVisitDoughnut.labels.push(aBook.title ?? '');
        } else {
          this.moreVisitDoughnut.labels = [aBook.title ?? ''];
        }
        if (this.moreVisitDoughnut.datasets) {
          if (this.moreVisitDoughnut.datasets[0].data) {
            this.moreVisitDoughnut.datasets[0].data.push(
              aBook.visitnumber ?? 0
            );
          } else {
            this.moreVisitDoughnut.datasets[0].data = [aBook.visitnumber ?? 0];
          }
        }
      });
    });
  }
}
