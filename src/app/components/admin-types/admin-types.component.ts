import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { Type } from 'src/app/interfaces/type';
import { TypeService } from 'src/app/services/type.service';

@Component({
  selector: 'app-admin-types',
  templateUrl: './admin-types.component.html',
  styleUrls: ['./admin-types.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminTypesComponent implements OnInit {
  typeDialog: boolean = false;
  type: Type = {};
  submitted: boolean = false;
  allTypes: Array<Type> = [];
  selectedTypes: Array<Type> = [];

  constructor(
    private ts: TypeService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.getAllTypesfunc();
  }

  openNew() {
    this.type = {};
    this.submitted = false;
    this.typeDialog = true;
  }

  deleteSelectedTypes() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected types ?',
      header: 'Confirm',
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
          message: 'Types deleted',
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
      message: 'Are you sure you want to delete ' + type.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (type.books && type.books.length == 0) {
          this.allTypes = this.allTypes.filter(
            (val) => val.id !== type.id
          );
          this.ts.deleteTheType(type.id).subscribe((el) => {});
          this.type = {};
          this.iziToast.success({
            message: 'Type deleted',
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: "You can't delete a Type with books",
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
          message: 'Type updated',
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
            message: 'Type created',
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
