import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Category } from 'src/app/interfaces/category';
import { Categorieservice } from 'src/app/services/category.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminCategoriesComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  categoryDialog: boolean = false;
  category: Category = {};
  submitted: boolean = false;
  allCategories: Array<Category> = [];
  selectedCategories: Array<Category> = [];

  constructor(
    private router: Router,
    private ts: Categorieservice,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());
    try {
      JSON.parse(this.storageCrypter.getItem('adminUser', 'session'));
    } catch (error) {
      this.router.navigateByUrl('/admin/login');
    }
    this.getAllCategoriesfunc();
  }

  openNew() {
    this.category = {};
    this.submitted = false;
    this.categoryDialog = true;
  }

  deleteSelectedCategories() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_categories.confirm_group_delete_categories_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allCategories = this.allCategories.filter(
          (val) =>
            !this.selectedCategories.includes(val) ||
            (val.books && val.books.length != 0)
        );
        this.selectedCategories.forEach((anCategory) => {
          if (anCategory.books && anCategory.books.length == 0) {
            this.ts.deleteTheCategory(anCategory.id).subscribe((el) => {});
          }
        });
        this.selectedCategories = [];
        this.iziToast.success({
          message: this.translate.instant('admin_categories.categories_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editCategory(category: Category) {
    this.category = { ...category };
    this.categoryDialog = true;
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_categories.confirm_delete_category_message',
        { name: category.name }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (category.books && category.books.length == 0) {
          this.allCategories = this.allCategories.filter((val) => val.id !== category.id);
          this.ts.deleteTheCategory(category.id).subscribe((el) => {});
          this.category = {};
          this.iziToast.success({
            message: this.translate.instant('admin_categories.category_deleted'),
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: this.translate.instant(
              'admin_categories.you_can_t_delete_a_category_with_books'
            ),
            position: 'topRight',
          });
        }
      },
    });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.submitted = false;
  }

  saveCategory() {
    this.submitted = true;

    if (this.category.id) {
      this.ts.updateCategory(this.category.id, this.category).subscribe((result) => {
        this.category = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_categories.category_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allCategories.push(this.category);
      this.ts.createCategory(this.category).subscribe((res) => {
        this.ts.updateCategory(res.id, this.category).subscribe((result) => {
          this.category = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_categories.category_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allCategories = [...this.allCategories];
    this.categoryDialog = false;
    this.category = {};
  }

  getAllCategoriesfunc() {
    this.ts.getAllCategories().subscribe((res) => {
      this.allCategories = res;
    });
  }
}
