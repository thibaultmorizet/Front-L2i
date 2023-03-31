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
import { CommentService } from 'src/app/services/comment.service';
import { Comment } from 'src/app/interfaces/comment';
import { ConfirmationService } from 'primeng/api';
import { BookService } from 'src/app/services/book.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
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
  deleteCommentButtonDisable: boolean = false;
  commentToSend: Comment = {};

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private ps: ProductService,
    private bs: BookService,
    private vs: VideoService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private authService: SocialAuthService,
    private translate: TranslateService,
    private commentService: CommentService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());

    this.route.paramMap.subscribe((res) => {
      this.idProduct = +(res.get('id') ?? '0');
      this.ps.getOneProduct(this.idProduct).subscribe((b) => {
        if (b.brand) {
          this.vs.getOneVideo(this.idProduct).subscribe((result) => {
            this.product = result;
            this.product.type = 'video';
            if (this.product.comments) {
              this.product.comments.sort((objA, objB) => {
                if (
                  objB.createdAt != undefined &&
                  objA.createdAt != undefined
                ) {
                  let date1 = new Date(objA.createdAt);
                  let date2 = new Date(objB.createdAt);

                  return date2.getTime() - date1.getTime();
                }
                return 0;
              });
            }

            this.product.number_ordered = 1;
            if (this.product.visitnumber) {
              this.product.visitnumber += 1;
            } else {
              this.product.visitnumber = 1;
            }

            this.ps
              .updateProduct(this.product.id, this.product)
              .subscribe(() => {});
          });
        } else {
          this.bs.getOneBook(this.idProduct).subscribe((result) => {
            this.product = result;
            this.product.type = 'book';

            this.product.number_ordered = 1;
            if (this.product.visitnumber) {
              this.product.visitnumber += 1;
            } else {
              this.product.visitnumber = 1;
            }

            this.ps
              .updateProduct(this.product.id, this.product)
              .subscribe(() => {
                if (this.product.comments) {
                  this.product.comments.forEach((aComment) => {
                    if (
                      aComment.commentstatut?.id == 3 ||
                      (aComment.commentstatut?.id == 1 &&
                        this.connectedUser?.id != aComment.user?.id)
                    ) {
                      this.product.comments?.splice(
                        this.product.comments.indexOf(aComment),
                        1
                      );
                    }
                  });
                  this.product.comments.sort((objA, objB) => {
                    if (
                      objB.createdAt != undefined &&
                      objA.createdAt != undefined
                    ) {
                      let date1 = new Date(objA.createdAt);
                      let date2 = new Date(objB.createdAt);

                      return date2.getTime() - date1.getTime();
                    }
                    return 0;
                  });
                }
              });
          });
        }
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
                    productNumber:
                      el.number_ordered + productToOrder.number_ordered,
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
                  message: this.translate.instant(
                    'izitoast.product_add_to_cart'
                  ),
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
            return;
          }
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
      });
    }
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
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
      }
      return unitpriceht.toFixed(2);
    }
    return null;
  }

  getCommentDate(createdAt: Date | undefined) {
    if (typeof createdAt == 'string') {
      const date = new Date(createdAt);
      const now = new Date();
      const time = now.getTime() - date.getTime();
      const msInDay = 24 * 60 * 60 * 1000;
      const msInHour = 60 * 60 * 1000;
      const msInMinute = 60 * 1000;
      const msInSecond = 1000;

      if (time / msInDay >= 7) {
        return this.translate.instant('product_details.on_date_at_hour', {
          date: date.toLocaleDateString(),
          hours: date.getHours() + ':' + date.getMinutes(),
        });
      }
      if (time / msInDay >= 1) {
        return this.translate.instant('product_details.days_ago', {
          count: (time / msInDay).toFixed(0),
        });
      }
      if (time / msInHour >= 1) {
        return this.translate.instant('product_details.hours_ago', {
          count: (time / msInHour).toFixed(0),
        });
      }
      if (time / msInMinute >= 1) {
        return this.translate.instant('product_details.minutes_ago', {
          count: (time / msInMinute).toFixed(0),
        });
      }
      if (time / msInSecond >= 1) {
        return this.translate.instant('product_details.seconds_ago', {
          count: (time / msInSecond).toFixed(0),
        });
      }
      return '';
    }
    return '';
  }
  confirmDeleteComment(id: number | undefined) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'product_details.are_you_sure_that_you_want_delete_this_comment'
      ),
      header: this.translate.instant('product_details.delete_this_comment'),
      dismissableMask: true,
      accept: () => {
        this.deleteComment(id);
      },
    });
  }
  deleteComment(id: number | undefined) {
    this.deleteCommentButtonDisable = true;
    this.commentService.getCommentById(id).subscribe((el) => {
      if (typeof el[0] == 'object' && el[0].user) {
        if (el[0].user.id == this.connectedUser?.id) {
          this.commentService.deleteTheComment(el[0].id).subscribe((res) => {
            if (this.product.comments) {
              this.product.comments.forEach(function (element, index, object) {
                if (element.id == el[0].id) {
                  object.splice(index, 1);
                }
              });
            }
            this.iziToast.success({
              message: this.translate.instant(
                'product_details.comment_deleted'
              ),
              position: 'topRight',
            });
            this.deleteCommentButtonDisable = false;
          });
          return;
        }
        this.iziToast.error({
          message: this.translate.instant(
            'product_details.you_can_t_delete_this_comment'
          ),
          position: 'topRight',
        });
        this.deleteCommentButtonDisable = false;
      }
    });
  }

  sendComment() {
    if (this.commentToSend.text != '') {
      if (this.connectedUser && this.connectedUser.id && this.product) {
        this.commentToSend.commentstatut = {
          id: 1,
        };
        this.commentToSend.user = this.connectedUser;
        this.commentToSend.product = this.product;
        this.commentToSend.createdAt = new Date();

        this.commentService.setComment(this.commentToSend).subscribe((el) => {
          if (typeof el == 'object') {
            this.product.comments?.unshift(el);
            this.iziToast.success({
              message: this.translate.instant('product_details.comment_sent'),
              position: 'topRight',
            });
            this.commentToSend = {};
            return;
          }
          this.iziToast.error({
            message: this.translate.instant('general.error'),
            position: 'topRight',
          });
        });
      }
    }
  }
}
