import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { PrimeNGConfig } from 'primeng/api';
import { CarouselModule } from 'primeng/carousel';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  cart: Array<Product> = [];
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  productBestSell: Array<Product> = [];
  responsiveOptions: any;
  productExistinCart: Boolean = false;
  @ViewChild('bestSellCarousel') bestSellCarousel?: CarouselModule;
  carouselIsLoaded: boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private as: AuthService,
    private ps: ProductService,
    private authService: SocialAuthService,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    this.responsiveOptions = [
      {
        breakpoint: '3000px',
        numVisible: 7,
        numScroll: 1,
      },
      {
        breakpoint: '1800px',
        numVisible: 6,
        numScroll: 1,
      },
      {
        breakpoint: '1300px',
        numVisible: 5,
        numScroll: 1,
      },
      {
        breakpoint: '1000px',
        numVisible: 4,
        numScroll: 1,
      },
      {
        breakpoint: '800px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '500px',
        numVisible: 2,
        numScroll: 1,
      },
    ];

    this.getProductsBestSell();
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      }
    }
    if (document.getElementsByClassName('p-carousel-indicators')[0]) {
      (
        document.getElementsByClassName(
          'p-carousel-indicators'
        )[0] as HTMLElement
      ).click();
    }
  }

  getProductsBestSell() {
    this.ps.getProductsBestSell().subscribe((res) => {
      this.productBestSell = res;
    });
  }
  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }

  nextBestProduct() {
    (
      document.getElementsByClassName('p-carousel-next')[0] as HTMLElement
    ).click();
  }

  prevBestProduct() {
    (
      document.getElementsByClassName('p-carousel-prev')[0] as HTMLElement
    ).click();
  }
  addProductToCart(productId: number | undefined) {
    this.productExistinCart = false;
    if (productId != undefined) {
      this.ps.getOneProduct(productId).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.productExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              el.number_ordered + 1 > el.stock
            ) {
              this.iziToast.error({
                title: this.translate.instant('izitoast.lack_of_stock'),
                message: this.translate.instant(
                  'izitoast.lack_of_stock_message',
                  {
                    productStock: res.stock,
                    productTitle: res.title,
                    productNumber: el.number_ordered + 1,
                  }
                ),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered = el.number_ordered + 1;
                if (el.unitpriceht) {
                  el.totalpriceht = parseFloat(
                    (el.number_ordered * el.unitpriceht).toFixed(2)
                  );
                  if (el.taxe?.tva) {
                    el.totalpricettc = parseFloat(
                      (
                        el.number_ordered *
                        (el.unitpriceht + (el.taxe.tva * el.unitpriceht) / 100)
                      ).toFixed(2)
                    );
                  }
                }
                this.iziToast.success({
                  message: this.translate.instant('izitoast.product_add_to_cart'),
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'cart',
                  JSON.stringify(this.cart),
                  'local'
                );
              }
            }
          }
        });

        if (!this.productExistinCart) {
          if (res.stock && 1 > res.stock) {
            this.iziToast.error({
              title: this.translate.instant('izitoast.lack_of_stock'),
              message: this.translate.instant(
                'izitoast.lack_of_stock_message',
                {
                  productStock: res.stock,
                  productTitle: res.title,
                  productNumber: 1,
                }
              ),
              position: 'topRight',
            });
          } else {
            res.number_ordered = 1;
            if (res.unitpriceht) {
              res.totalpriceht = parseFloat(
                (res.number_ordered * res.unitpriceht).toFixed(2)
              );
              if (res.taxe?.tva) {
                res.totalpricettc = parseFloat(
                  (
                    res.number_ordered *
                    (res.unitpriceht + (res.taxe.tva * res.unitpriceht) / 100)
                  ).toFixed(2)
                );
              }
            }

            this.cart.push(res);
            this.iziToast.success({
              message: this.translate.instant('izitoast.product_add_to_cart'),
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'cart',
              JSON.stringify(this.cart),
              'local'
            );
          }
        }
      });
    }
  }
  getUnitpricettcFromUnitpricehtAndTva(
    unitpriceht: number | undefined,
    tva: number | undefined
  ) {
    if (unitpriceht != undefined) {
      if (tva != undefined) {
        return (unitpriceht + (tva * unitpriceht) / 100).toFixed(2);
      } else {
        return unitpriceht.toFixed(2);
      }
    } else {
      return null;
    }
  }
}
