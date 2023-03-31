import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
    private router: Router,
    private es: EditorService,
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
    this.getAllEditorsfunc();
  }

  openNew() {
    this.editor = {};
    this.submitted = false;
    this.editorDialog = true;
  }

  deleteSelectedEditors() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_editors.confirm_group_delete_editors_message'
      ),
      header: this.translate.instant('general.confirm'),
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
          message: this.translate.instant('admin_editors.editors_deleted'),
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
      message: this.translate.instant(
        'admin_formats.confirm_delete_format_message',
        { name: editor.name }
      ),
      header: this.translate.instant('general.confirm'),
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
            message: this.translate.instant('admin_editors.editor_deleted'),
            position: 'topRight',
          });
          return;
        }
        this.iziToast.warning({
          message: this.translate.instant(
            'admin_editors.you_can_t_delete_an_editor_with_products'
          ),
          position: 'topRight',
        });
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
          message: this.translate.instant('admin_editors.editor_updated'),
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
            message: this.translate.instant('admin_editors.editor_created'),
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
