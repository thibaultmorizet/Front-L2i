import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Brand } from 'src/app/interfaces/brand';
import { BrandService } from 'src/app/services/brand.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-brands',
  templateUrl: './admin-brands.component.html',
  styleUrls: ['./admin-brands.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})

export class AdminBrandsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  brandDialog: boolean = false;
  brand: Brand = {};
  submitted: boolean = false;
  allBrands: Array<Brand> = [];
  selectedBrands: Array<Brand> = [];

  constructor(
    private router: Router,
    private brandService: BrandService,
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
    this.getAllBrandsfunc();
  }

  openNew() {
    this.brand = {};
    this.submitted = false;
    this.brandDialog = true;
  }

  deleteSelectedBrands() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_brands.confirm_group_delete_brands_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allBrands = this.allBrands.filter(
          (val) =>
            !this.selectedBrands.includes(val) ||
            (val.videos && val.videos.length != 0)
        );
        this.selectedBrands.forEach((anBrand) => {
          if (anBrand.videos && anBrand.videos.length == 0) {
            this.brandService.deleteTheBrand(anBrand.id).subscribe((el) => {});
          }
        });
        this.selectedBrands = [];
        this.iziToast.success({
          message: this.translate.instant('admin_brands.brands_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editBrand(brand: Brand) {
    this.brand = { ...brand };
    this.brandDialog = true;
  }

  deleteBrand(brand: Brand) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_formats.confirm_delete_format_message',
        { name: brand.name }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (brand.videos && brand.videos.length == 0) {
          this.allBrands = this.allBrands.filter(
            (val) => val.id !== brand.id
          );
          this.brandService.deleteTheBrand(brand.id).subscribe((el) => {});
          this.brand = {};
          this.iziToast.success({
            message: this.translate.instant('admin_brands.brand_deleted'),
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: this.translate.instant(
              'admin_brands.you_can_t_delete_a_brand_with_products'
            ),
            position: 'topRight',
          });
        }
      },
    });
  }

  hideDialog() {
    this.brandDialog = false;
    this.submitted = false;
  }

  saveBrand() {
    this.submitted = true;

    if (this.brand.id) {
      this.brandService.updateBrand(this.brand.id, this.brand).subscribe((result) => {
        this.brand = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_brands.brand_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allBrands.push(this.brand);
      this.brandService.createBrand(this.brand).subscribe((res) => {
        this.brandService.updateBrand(res.id, this.brand).subscribe((result) => {
          this.brand = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_brands.brand_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allBrands = [...this.allBrands];
    this.brandDialog = false;
    this.brand = {};
  }

  getAllBrandsfunc() {
    this.brandService.getAllBrands().subscribe((res) => {
      this.allBrands = res;
    });
  }
}
