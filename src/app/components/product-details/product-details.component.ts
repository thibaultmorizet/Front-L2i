import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';
import StorageCrypter from 'storage-crypter';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailsComponent implements OnInit {
  product: Product = {};
  idProduct: number = 0;
  cart: Array<Product> = [];
  storageCrypter = new StorageCrypter('Secret');
  productExistinCart: Boolean = false;
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedUser: User | null = {};
  productDetailsImgCoverIsLoaded: boolean = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private ps: ProductService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private authService: SocialAuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());

    this.route.paramMap.subscribe((res) => {
      this.idProduct = +(res.get('id') ?? '0');
      this.ps.getOneProduct(this.idProduct).subscribe((b) => {
        this.product = b;        
        this.product.number_ordered = 1;
        if (this.product.visitnumber) {
          this.product.visitnumber += 1;
        } else {
          this.product.visitnumber = 1;
        }

        this.ps.updateProduct(this.product.id, this.product).subscribe(() => {});
      });
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
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  addProductToCart(productToOrder: Product) {
    this.productExistinCart = false;
    if (productToOrder.id != undefined) {
      this.ps.getOneProduct(productToOrder.id).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.productExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              productToOrder.number_ordered &&
              el.number_ordered + productToOrder.number_ordered > el.stock
            ) {
              this.iziToast.error({
                title: this.translate.instant('izitoast.lack_of_stock'),
                message: this.translate.instant(
                  'izitoast.lack_of_stock_message',
                  {
                    productStock: res.stock,
                    productTitle: res.title,
                    productNumber: el.number_ordered + productToOrder.number_ordered,
                  }
                ),
                position: 'topRight',
              });
            } else {
              if (
                el.number_ordered != undefined &&
                productToOrder.number_ordered != undefined
              ) {
                el.number_ordered =
                  el.number_ordered + productToOrder.number_ordered;

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
          if (
            res.stock &&
            productToOrder.number_ordered &&
            productToOrder.number_ordered > res.stock
          ) {
            this.iziToast.error({
              title: this.translate.instant('izitoast.lack_of_stock'),
              message: this.translate.instant(
                'izitoast.lack_of_stock_message',
                {
                  productStock: res.stock,
                  productTitle: res.title,
                  productNumber: productToOrder.number_ordered,
                }
              ),
              position: 'topRight',
            });
          } else {
            res.number_ordered = productToOrder.number_ordered;

            if (res.unitpriceht && res.number_ordered) {
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

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
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
