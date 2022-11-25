import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Editor } from 'src/app/interfaces/editor';
import { EditorService } from 'src/app/services/editor.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-editors',
  templateUrl: './admin-editors.component.html',
  styleUrls: ['./admin-editors.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminEditorsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  editorDialog: boolean = false;
  editor: Editor = {};
  submitted: boolean = false;
  allEditors: Array<Editor> = [];
  selectedEditors: Array<Editor> = [];

  constructor(
    private router:Router,
    private es: EditorService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    try {
      JSON.parse(this.storageCrypter.getItem('adminUser', 'session'));
    } catch (error) {
      this.router.navigateByUrl('/admin/login');
    }
    this.getAllEditorsfunc();
  }

  openNew() {
    this.editor = {};
    this.submitted = false;
    this.editorDialog = true;
  }

  deleteSelectedEditors() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected editors ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allEditors = this.allEditors.filter(
          (val) =>
            !this.selectedEditors.includes(val) ||
            (val.books && val.books.length != 0)
        );
        this.selectedEditors.forEach((anEditor) => {
          if (anEditor.books && anEditor.books.length == 0) {
            this.es.deleteTheEditor(anEditor.id).subscribe((el) => {});
          }
        });
        this.selectedEditors = [];
        this.iziToast.success({
          message: 'Editors deleted',
          position: 'topRight',
        });
      },
    });
  }

  editEditor(editor: Editor) {
    this.editor = { ...editor };
    this.editorDialog = true;
  }

  deleteEditor(editor: Editor) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + editor.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (editor.books && editor.books.length == 0) {
          this.allEditors = this.allEditors.filter(
            (val) => val.id !== editor.id
          );
          this.es.deleteTheEditor(editor.id).subscribe((el) => {});
          this.editor = {};
          this.iziToast.success({
            message: 'Editor deleted',
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: "You can't delete a Editor with books",
            position: 'topRight',
          });
        }
      },
    });
  }

  hideDialog() {
    this.editorDialog = false;
    this.submitted = false;
  }

  saveEditor() {
    this.submitted = true;

    if (this.editor.id) {
      this.es.updateEditor(this.editor.id, this.editor).subscribe((result) => {
        this.editor = {};
        this.ngOnInit();
        this.iziToast.success({
          message: 'Editor updated',
          position: 'topRight',
        });
      });
    } else {
      this.allEditors.push(this.editor);
      this.es.createEditor(this.editor).subscribe((res) => {
        this.es.updateEditor(res.id, this.editor).subscribe((result) => {
          this.editor = {};
          this.ngOnInit();
          this.iziToast.success({
            message: 'Editor created',
            position: 'topRight',
          });
        });
      });
    }

    this.allEditors = [...this.allEditors];
    this.editorDialog = false;
    this.editor = {};
  }

  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      this.allEditors = res;
    });
  }
}
