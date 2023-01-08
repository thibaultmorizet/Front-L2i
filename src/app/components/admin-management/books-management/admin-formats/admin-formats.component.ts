import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Format } from 'src/app/interfaces/format';
import { FormatService } from 'src/app/services/format.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-formats',
  templateUrl: './admin-formats.component.html',
  styleUrls: ['./admin-formats.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminFormatsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  formatDialog: boolean = false;
  format: Format = {};
  submitted: boolean = false;
  allFormats: Array<Format> = [];
  selectedFormats: Array<Format> = [];

  constructor(
    private router: Router,
    private fs: FormatService,
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
    this.getAllFormatsfunc();
  }

  openNew() {
    this.format = {};
    this.submitted = false;
    this.formatDialog = true;
  }

  deleteSelectedFormats() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_formats.confirm_group_delete_formats_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allFormats = this.allFormats.filter(
          (val) =>
            !this.selectedFormats.includes(val) ||
            (val.books && val.books.length != 0)
        );
        this.selectedFormats.forEach((aFormat) => {
          if (aFormat.books && aFormat.books.length == 0) {
            this.fs.deleteTheFormat(aFormat.id).subscribe((el) => {});
          }
        });
        this.selectedFormats = [];
        this.iziToast.success({
          message: this.translate.instant('admin_formats.formats_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editFormat(format: Format) {
    this.format = { ...format };
    this.formatDialog = true;
  }

  deleteFormat(format: Format) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_formats.confirm_delete_format_message',
        { name: format.name }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (format.books && format.books.length == 0) {
          this.allFormats = this.allFormats.filter(
            (val) => val.id !== format.id
          );
          this.fs.deleteTheFormat(format.id).subscribe((el) => {});
          this.format = {};
          this.iziToast.success({
            message: this.translate.instant('admin_formats.format_deleted'),
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: this.translate.instant(
              'admin_formats.you_can_t_delete_a_format_with_products'
            ),
            position: 'topRight',
          });
        }
      },
    });
  }

  hideDialog() {
    this.formatDialog = false;
    this.submitted = false;
  }

  saveFormat() {
    this.submitted = true;

    if (this.format.id) {
      this.fs.updateFormat(this.format.id, this.format).subscribe((result) => {
        this.format = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_formats.format_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allFormats.push(this.format);
      this.fs.createFormat(this.format).subscribe((res) => {
        this.fs.updateFormat(res.id, this.format).subscribe((result) => {
          this.format = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_formats.format_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allFormats = [...this.allFormats];
    this.formatDialog = false;
    this.format = {};
  }

  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      this.allFormats = res;
    });
  }
}
