import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Book } from 'src/app/interfaces/book';
import { Editor } from 'src/app/interfaces/editor';
import { Format } from 'src/app/interfaces/format';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminBooksComponent implements OnInit {
  bookDialog: boolean = false;
  allBooks: Book[] = [];
  book: Book = {};
  selectedBooks: Book[] = [];
  submitted: boolean = false;
  statuses: any[] = [];
  updatedFormat: Format = {};
  updatedEditor: Editor = {};

  constructor(
    private bs: BookService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.bs
      .getAllBooksWithoutLimit([], [], '', [], null)
      .subscribe((data) => (this.allBooks = data));

    this.statuses = [
      { label: 'INSTOCK', value: 'instock' },
      { label: 'LOWSTOCK', value: 'lowstock' },
      { label: 'OUTOFSTOCK', value: 'outofstock' },
    ];
  }

  openNew() {
    this.book = {};
    this.submitted = false;
    this.bookDialog = true;
  }

  deleteSelectedBooks() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected books?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.allBooks = this.allBooks.filter(
          (val) => !this.selectedBooks.includes(val)
        );
        this.selectedBooks = [];
        /* this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'books Deleted',
          life: 3000,
        }); */
      },
    });
  }

  editBook(book: Book) {
    this.book = { ...book };
    this.bookDialog = true;
  }

  deletebook(book: Book) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + book.title + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.allBooks = this.allBooks.filter((val) => val.id !== book.id);
        this.book = {};
        /*  this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'book Deleted',
          life: 3000,
        }); */
      },
    });
  }

  hideDialog() {
    this.bookDialog = false;
    this.submitted = false;
  }

  saveBook() {
    this.submitted = true;

    if (this.book.title && this.book.title.trim()) {
      if (this.book.id) {
        this.allBooks[this.findIndexById(this.book.id)] = this.book;
        /* this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'book Updated',
          life: 3000,
        }); */
      } else {
        /*         this.book.id = this.createId();*/
        this.book.image = 'book-placeholder.svg';
        this.allBooks.push(this.book);
        /* this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'book Created',
          life: 3000,
        }); */
      }

      this.allBooks = [...this.allBooks];
      this.bookDialog = false;
      this.book = {};
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.allBooks.length; i++) {
      if (this.allBooks[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
}
