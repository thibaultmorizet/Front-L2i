import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { Author } from 'src/app/interfaces/author';
import { AuthorService } from 'src/app/services/author.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-auhtors',
  templateUrl: './admin-authors.component.html',
  styleUrls: ['./admin-authors.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminAuthorsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  authorDialog: boolean = false;
  author: Author = {};
  submitted: boolean = false;
  allAuthors: Array<Author> = [];
  selectedAuthors: Array<Author> = [];

  constructor(
    private router: Router,
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
      JSON.parse(this.storageCrypter.getItem('adminUser', 'session'));
    } catch (error) {
      this.router.navigateByUrl('/admin/login');
    }
    this.getAllAuthorsfunc();
  }

  openNew() {
    this.author = {};
    this.submitted = false;
    this.authorDialog = true;
  }

  deleteSelectedAuthors() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_authors.confirm_group_delete_authors_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allAuthors = this.allAuthors.filter(
          (val) =>
            !this.selectedAuthors.includes(val) ||
            (val.books && val.books.length != 0)
        );
        this.selectedAuthors.forEach((anAuthor) => {
          if (anAuthor.books && anAuthor.books.length == 0) {
            this.authorService
              .deleteTheAuthor(anAuthor.id)
              .subscribe(() => {});
          }
        });
        this.selectedAuthors = [];
        this.iziToast.success({
          message: this.translate.instant('admin_authors.authors_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editAuthor(author: Author) {
    this.author = { ...author };
    this.authorDialog = true;
  }

  deleteAuthor(author: Author) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_authors.confirm_delete_author_message',
        { firstname: author.firstname, lastname: author.lastname }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (author.books && author.books.length == 0) {
          this.allAuthors = this.allAuthors.filter(
            (val) => val.id !== author.id
          );
          this.authorService.deleteTheAuthor(author.id).subscribe(() => {});
          this.author = {};
          this.iziToast.success({
            message: this.translate.instant('admin_authors.author_deleted'),
            position: 'topRight',
          });
          return;
        }
        this.iziToast.warning({
          message: this.translate.instant(
            'admin_authors.you_can_t_delete_a_author_with_products'
          ),
          position: 'topRight',
        });
      },
    });
  }

  hideDialog() {
    this.authorDialog = false;
    this.submitted = false;
  }

  saveAuthor() {
    this.submitted = true;

    if (this.author.id) {
      this.authorService
        .updateAuthor(this.author.id, this.author)
        .subscribe(() => {
          this.author = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_authors.author_updated'),
            position: 'topRight',
          });
        });
    } else {
      this.allAuthors.push(this.author);
      this.authorService.createAuthor(this.author).subscribe((res) => {
        this.authorService
          .updateAuthor(res.id, this.author)
          .subscribe(() => {
            this.author = {};
            this.ngOnInit();
            this.iziToast.success({
              message: this.translate.instant('admin_authors.author_created'),
              position: 'topRight',
            });
          });
      });
    }

    this.allAuthors = [...this.allAuthors];
    this.authorDialog = false;
    this.author = {};
  }

  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      this.allAuthors = res;
    });
  }
}
