import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
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
  templateUrl: './admin-auhtors.component.html',
  styleUrls: ['./admin-auhtors.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminAuhtorsComponent implements OnInit {
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
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
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
      message: 'Are you sure you want to delete the selected authors ?',
      header: 'Confirm',
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
              .subscribe((el) => {});
          }
        });
        this.selectedAuthors = [];
        this.iziToast.success({
          message: 'Authors deleted',
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
      message: 'Are you sure you want to delete ' + author.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        if (author.books && author.books.length == 0) {
          this.allAuthors = this.allAuthors.filter(
            (val) => val.id !== author.id
          );
          this.authorService.deleteTheAuthor(author.id).subscribe((el) => {});
          this.author = {};
          this.iziToast.success({
            message: 'Author deleted',
            position: 'topRight',
          });
        } else {
          this.iziToast.warning({
            message: "You can't delete a Author with books",
            position: 'topRight',
          });
        }
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
        .subscribe((result) => {
          this.author = {};
          this.ngOnInit();
          this.iziToast.success({
            message: 'Author updated',
            position: 'topRight',
          });
        });
    } else {
      this.allAuthors.push(this.author);
      this.authorService.createAuthor(this.author).subscribe((res) => {
        this.authorService
          .updateAuthor(res.id, this.author)
          .subscribe((result) => {
            this.author = {};
            this.ngOnInit();
            this.iziToast.success({
              message: 'Author created',
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
