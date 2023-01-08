import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';
import { FormatService } from 'src/app/services/format.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';
import { Category } from 'src/app/interfaces/category';
import { Categoryservice } from 'src/app/services/category.service';
import StorageCrypter from 'storage-crypter';
import { NgxIzitoastService } from 'ngx-izitoast';
import { SocialAuthService, SocialUser } from 'angularx-social-login';

import { Editor } from 'src/app/interfaces/editor';
import { EditorService } from 'src/app/services/editor.service';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/interfaces/author';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { TaxeService } from 'src/app/services/taxe.service';
import { Brand } from 'src/app/interfaces/brand';
import { BrandService } from 'src/app/services/brand.service';
import { BookService } from 'src/app/services/book.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ShopComponent implements OnInit {
  cart: Array<Product> = [];
  products: Array<Product> = [];
  allProducts: Array<Product> = [];
  formats: Array<Format> = [];
  types: Array<String> = [];
  editors: Array<Editor> = [];
  brands: Array<Brand> = [];
  authors: Array<Author> = [];
  categories: Array<Category> = [];
  user: User = {};
  searchProduct: any = {};
  productExistinCart: Boolean = false;
  numberToOrder: string = '1';
  storageCrypter = new StorageCrypter('Secret');
  userInscription: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedUser: User | null = {};
  actualUpdateproduct: Product = {};
  fileToUpload: any = {};
  pageRows: number = 12;

  selectedFormat: Array<Format> = [];
  selectedBrand: Array<Brand> = [];
  selectedType: Array<String> = [];
  selectedCategory: Array<Category> = [];
  selectedPriceRange: Array<number> = [0, 0];
  showProductsInStock: boolean = true;
  filteredProducts: Array<Product> = [];
  maxPrice: number = 0;

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private ps: ProductService,
    private fs: FormatService,
    private es: EditorService,
    private bookService: BookService,
    private videoService: VideoService,
    private brandService: BrandService,
    private taxeService: TaxeService,
    private authorService: AuthorService,
    private cs: Categoryservice,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private authService: SocialAuthService,
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    this.ps.getAllProductsWithoutLimit('', [], true).subscribe((res) => {
      res.forEach((aProduct) => {
        if (
          aProduct.unitpriceht &&
          aProduct.taxe?.tva &&
          (Math.ceil(
            aProduct.unitpriceht +
              (aProduct.taxe.tva * aProduct.unitpriceht) / 100
          ) > this.selectedPriceRange[1] ||
            this.selectedPriceRange[1] == undefined)
        ) {
          this.maxPrice = Math.ceil(
            aProduct.unitpriceht +
              (aProduct.taxe.tva * aProduct.unitpriceht) / 100
          );
          this.selectedPriceRange = [
            0,
            Math.ceil(
              aProduct.unitpriceht +
                (aProduct.taxe.tva * aProduct.unitpriceht) / 100
            ),
          ];
        }
      });
    });
    this.getProducts();
    this.getAllProducts();
    setTimeout(() => {
      this.getAllTypesfunc();
    }, 100);
    this.getAllFormatsfunc();
    this.getAllBrandsfunc();
    this.getAllEditorsfunc();
    this.getAllAuthorsfunc();
    this.getAllCategoriesfunc();
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

    this.fileToUpload = {};
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }
  getProducts() {
    this.ps.getAllProducts(this.showProductsInStock).subscribe((res) => {
      this.products = res;
    });
  }
  getAllProducts(
    formatFilter: Array<Format> = [],
    categoryFilter: Array<Category> = [],
    searchProduct: string = '',
    prices: Array<number> = []
  ) {
    this.ps
      .getAllProductsWithoutLimit(
        searchProduct,
        prices,
        this.showProductsInStock
      )
      .subscribe((res) => {
        this.allProducts = res;
        this.filteredProducts = res;
      });
  }
  getAllTypesfunc() {
    this.types.push(
      this.translate.instant('general.book'),
      this.translate.instant('general.video')
    );
  }
  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      this.formats = res;
    });
  }
  getAllBrandsfunc() {
    this.brandService.getAllBrands().subscribe((res) => {
      this.brands = res;
    });
  }
  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      this.editors = res;
    });
  }
  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      this.authors = res;
    });
  }
  getAllCategoriesfunc() {
    this.cs.getAllCategories().subscribe((res) => {
      this.categories = res;
    });
  }
  getAllProductsByPage(event: any) {
    if (this.selectedType[0] == undefined) {
      this.ps
        .getAllProductsForPage(
          event.page + 1,
          event.rows,
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.pageRows = event.rows;
        });
    } else if (
      this.selectedType.includes('Livre') ||
      this.selectedType.includes('Book')
    ) {
      this.bookService
        .getAllBooksForPage(
          event.page + 1,
          event.rows,
          this.selectedFormat,
          this.selectedCategory,
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.pageRows = event.rows;
        });
    }else if (this.selectedType.includes('Video')) {
      this.videoService
        .getAllVideosForPage(
          event.page + 1,
          event.rows,
          this.selectedBrand,
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.pageRows = event.rows;
        });
    }
  }
  getProductsWithTypeAndBrandAndFormatAndCategoryAndPriceAndSearch() {
    if (this.selectedType[0] == undefined) {
      this.ps
        .getAllProductsBySearch(
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.pageRows,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.ps
            .getAllProductsBySearch(
              this.searchProduct?.title ?? this.searchProduct,
              this.selectedPriceRange,
              10000,
              this.showProductsInStock
            )
            .subscribe((el) => {
              this.filteredProducts = el;
            });
        });
    } else if (
      this.selectedType.includes('Livre') ||
      this.selectedType.includes('Book')
    ) {
      this.bookService
        .getAllBooksBySearchAndParameters(
          this.selectedFormat,
          this.selectedCategory,
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.pageRows,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.bookService
            .getAllBooksBySearchAndParameters(
              this.selectedFormat,
              this.selectedCategory,
              this.searchProduct?.title ?? this.searchProduct,
              this.selectedPriceRange,
              10000,
              this.showProductsInStock
            )
            .subscribe((el) => {
              this.filteredProducts = el;
            });
        });
    } else if (this.selectedType.includes('Video')) {
      this.videoService
        .getAllVideosBySearchAndParameters(
          this.selectedBrand,
          this.searchProduct?.title ?? this.searchProduct,
          this.selectedPriceRange,
          this.pageRows,
          this.showProductsInStock
        )
        .subscribe((res) => {
          this.products = res;
          this.videoService
            .getAllVideosBySearchAndParameters(
              this.selectedBrand,
              this.searchProduct?.title ?? this.searchProduct,
              this.selectedPriceRange,
              10000,
              this.showProductsInStock
            )
            .subscribe((el) => {
              this.filteredProducts = el;
            });
        });
    }
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

  filterProduct(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.allProducts.length; i++) {
      let product = this.allProducts[i];
      if (
        product.title &&
        product.title.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(product);
      } else if (product.author) {
        product.author.forEach((anAuthor) => {
          if (
            (anAuthor.firstname &&
              anAuthor.firstname.toLowerCase().indexOf(query.toLowerCase()) ==
                0) ||
            (anAuthor.lastname &&
              anAuthor.lastname.toLowerCase().indexOf(query.toLowerCase()) == 0)
          ) {
            filtered.push(product);
          }
        });
      }
    }

    this.filteredProducts = filtered;
  }

  updateShowProductsInStock() {
    this.showProductsInStock = !this.showProductsInStock;
    this.getProductsWithTypeAndBrandAndFormatAndCategoryAndPriceAndSearch();
  }

  clearAllFilter() {
    this.selectedFormat = [];
    this.selectedBrand = [];
    this.selectedType = [];
    this.selectedCategory = [];
    this.selectedPriceRange = [0, this.maxPrice];
    this.showProductsInStock = true;
    this.searchProduct = null;

    this.getProductsWithTypeAndBrandAndFormatAndCategoryAndPriceAndSearch();
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
