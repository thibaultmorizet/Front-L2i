import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Type } from 'src/app/interfaces/type';
import { TypeService } from 'src/app/services/type.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-types',
  templateUrl: './admin-types.component.html',
  styleUrls: ['./admin-types.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminTypesComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  typeDialog: boolean = false;
  type: Type = {};
  submitted: boolean = false;
  allTypes: Array<Type> = [];
  selectedTypes: Array<Type> = [];

  constructor(
    private router: Router,
    private ts: TypeService,
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
    this.getAllTypesfunc();
  }

  openNew() {
    this.type = {};
    this.submitted = false;
    this.typeDialog = true;
  }

  deleteSelectedTypes() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_types.confirm_group_delete_types_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allTypes = this.allTypes.filter(
          (val) =>
            !this.selectedTypes.includes(val) ||
            (val.books && val.books.length != 0)
        );
        this.selectedTypes.forEach((anType) => {
          if (anType.books && anType.books.length == 0) {
            this.ts.deleteTheType(anType.id).subscribe((el) => {});
          }
        });
        this.selectedTypes = [];
        this.iziToast.success({
          message: this.translate.instant('admin_types.types_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editType(type: Type) {
    this.type = { ...type };
    this.typeDialog = true;
  }

  deleteType(type: Type) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_types.confirm_delete_type_message',
        { name: type.name }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (type.books && type.books.length == 0) {
          this.allTypes = this.allTypes.filter((val) => val.id !== type.id);
          this.ts.deleteTheType(type.id).subscribe((el) => {});
          this.type = {};
          this.iziToast.success({
            message: this.translate.instant('admin_types.type_deleted'),
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: this.translate.instant(
              'admin_types.you_can_t_delete_a_type_with_books'
            ),
            position: 'topRight',
          });
        }
      },
    });
  }

  hideDialog() {
    this.typeDialog = false;
    this.submitted = false;
  }

  saveType() {
    this.submitted = true;

    if (this.type.id) {
      this.ts.updateType(this.type.id, this.type).subscribe((result) => {
        this.type = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_types.type_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allTypes.push(this.type);
      this.ts.createType(this.type).subscribe((res) => {
        this.ts.updateType(res.id, this.type).subscribe((result) => {
          this.type = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_types.type_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allTypes = [...this.allTypes];
    this.typeDialog = false;
    this.type = {};
  }

  getAllTypesfunc() {
    this.ts.getAllTypes().subscribe((res) => {
      this.allTypes = res;
    });
  }
}
