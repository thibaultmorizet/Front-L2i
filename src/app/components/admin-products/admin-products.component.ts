import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Observable, Subscriber } from 'rxjs';
import { Author } from 'src/app/interfaces/author';
import { Product } from 'src/app/interfaces/product';
import { Editor } from 'src/app/interfaces/editor';
import { Format } from 'src/app/interfaces/format';
import { Image } from 'src/app/interfaces/image';
import { Taxe } from 'src/app/interfaces/taxe';
import { Category } from 'src/app/interfaces/category';
import { User } from 'src/app/interfaces/user';
import { AuthorService } from 'src/app/services/author.service';
import { ProductService } from 'src/app/services/product.service';
import { EditorService } from 'src/app/services/editor.service';
import { FormatService } from 'src/app/services/format.service';
import { TaxeService } from 'src/app/services/taxe.service';
import { Categoryservice } from 'src/app/services/category.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminProductsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  productDialog: boolean = false;
  allProducts: Product[] = [];
  product: Product = {};
  selectedProducts: Product[] = [];
  submitted: boolean = false;
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  taxes: Array<Taxe> = [];
  authors: Array<Author> = [];
  categories: Array<Category> = [];
  imageInfo: Image = {};

  constructor(
    private router: Router,
    private ps: ProductService,
    private fs: FormatService,
    private es: EditorService,
    private taxeService: TaxeService,
    private cs: Categoryservice,
    private authorService: AuthorService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

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

    this.ps
      .getAllProductsWithoutLimit([], [], '', [], null)
      .subscribe((data) => (this.allProducts = data));

    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllTaxesfunc();
    this.getAllAuthorsfunc();
    this.getAllCategoriesfunc();
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
  openNew() {
    this.product = {
      unitpriceht: 1,
      stock: 1,
      year: '1850',
    };
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_products.confirm_group_delete_products_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allProducts = this.allProducts.filter(
          (val) => !this.selectedProducts.includes(val)
        );
        this.selectedProducts.forEach((aProduct) => {
          let imageUrlToDelete = {
            imageUrl: aProduct.image?.substring(aProduct.image?.indexOf('assets')),
          };

          this.ps.deleteImage(imageUrlToDelete).subscribe((el) => {});

          this.ps.deleteTheProduct(aProduct.id).subscribe((el) => {});
        });
        this.selectedProducts = [];
        this.iziToast.success({
          message: this.translate.instant('admin_products.products_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editProduct(product: Product) {
    product.author?.forEach((anAuthor) => {
      anAuthor.name = anAuthor.firstname + ' ' + anAuthor.lastname;
    });
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteproduct(product: Product) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_products.confirm_delete_product_message',
        { title: product.title }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allProducts = this.allProducts.filter((val) => val.id !== product.id);
        let imageUrlToDelete = {
          imageUrl: product.image?.substring(product.image?.indexOf('assets')),
        };

        this.ps.deleteImage(imageUrlToDelete).subscribe((el) => {});
        this.ps.deleteTheProduct(product.id).subscribe((el) => {});
        this.product = {};

        this.iziToast.success({
          message: this.translate.instant('admin_products.product_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.year) {
      this.product.year = this.product.year.toString();
    }
    if (this.product.id) {
      if (this.imageInfo.data) {
        this.imageInfo.productId = this.product.id?.toString();

        if (this.imageInfo.url) {
          this.product.image =
            'https://www.thibaultmorizet.fr/assets/product-images/' +
            this.product.id +
            '.' +
            this.imageInfo.url.split('.').pop();
        } else {
          this.product.image =
            'https://www.thibaultmorizet.fr/assets/product-images/' + this.product.id + '.jpeg';
        }
        this.ps.addImage(this.imageInfo).subscribe();
      }
      this.ps.updateProduct(this.product.id, this.product).subscribe((result) => {
        this.product = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_products.product_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allProducts.push(this.product);
      this.ps.createProduct(this.product).subscribe((res) => {
        if (this.imageInfo.data) {
          this.imageInfo.productId = res.id?.toString();
          if (this.imageInfo.url) {
            this.product.image =
              'https://www.thibaultmorizet.fr/assets/product-images/' +
              res.id +
              '.' +
              this.imageInfo.url.split('.').pop();
          } else {
            this.product.image =
              'https://www.thibaultmorizet.fr/assets/product-images/' + res.id + '.jpeg';
          }

          this.ps.addImage(this.imageInfo).subscribe();
        }
        this.ps.updateProduct(res.id, this.product).subscribe((result) => {
          this.product = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_products.product_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allProducts = [...this.allProducts];
    this.productDialog = false;
    this.product = {};
  }
  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      res.forEach((aFormat) => {
        delete aFormat.products;
      });
      this.formats = res;
    });
  }
  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      res.forEach((anEditor) => {
        delete anEditor.products;
      });
      this.editors = res;
    });
  }
  getAllTaxesfunc() {
    this.taxeService.getAllTaxes().subscribe((res) => {
      res.forEach((aTaxe) => {
        delete aTaxe.products;
      });
      this.taxes = res;
    });
  }
  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      res.forEach((anAuthor) => {
        delete anAuthor.products;
        anAuthor.name = anAuthor.firstname + ' ' + anAuthor.lastname;
      });
      this.authors = res;
    });
  }
  getAllCategoriesfunc() {
    this.cs.getAllCategories().subscribe((res) => {
      res.forEach((aCategory) => {
        delete aCategory.products;
      });
      this.categories = res;
    });
  }

  addImageToServer($event: Event) {
    const target = $event.target as HTMLInputElement;

    const file: File = (target.files as FileList)[0];

    this.imageInfo = {
      url: file.name,
    };

    this.convertToBase64(file);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      this.imageInfo.data = d.substring(d.indexOf('base64,') + 7);
    });
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    };
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
