import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Format } from 'src/app/interfaces/format';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-admin-formats',
  templateUrl: './admin-formats.component.html',
  styleUrls: ['./admin-formats.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminFormatsComponent implements OnInit {
  formatDialog: boolean = false;
  format: Format = {};
  submitted: boolean = false;
  allFormats: Array<Format> = [];
  selectedFormats: Array<Format> = [];

  constructor(
    private fs: FormatService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.getAllFormatsfunc();
  }

  openNew() {
    this.format = {};
    this.submitted = false;
    this.formatDialog = true;
  }

  deleteSelectedFormats() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected formats ?',
      header: 'Confirm',
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
          message: 'Formats deleted',
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
      message: 'Are you sure you want to delete ' + format.name + '?',
      header: 'Confirm',
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
            message: 'Format deleted',
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: "You can't delete a Format with books",
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
          message: 'Format updated',
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
            message: 'Format created',
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