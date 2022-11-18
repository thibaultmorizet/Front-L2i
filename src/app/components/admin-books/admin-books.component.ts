import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css'],
})
export class AdminBooksComponent implements OnInit {
  bookDialog: boolean = false;
  books: Book[] = [];
  book: Book = {};
  selectedBooks: Book[] = [];
  submitted: boolean = false;
  statuses: any[] = [];

  constructor(
    private bs: BookService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.bs
      .getAllBooksWithoutLimit([], [], '', [], null)
      .subscribe((data) => (this.books = data));

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
        this.books = this.books.filter(
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
        this.books = this.books.filter((val) => val.id !== book.id);
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
        this.books[this.findIndexById(this.book.id)] = this.book;
        /* this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'book Updated',
          life: 3000,
        }); */
      } else {
        /*         this.book.id = this.createId();*/
        this.book.image = 'book-placeholder.svg';
        this.books.push(this.book);
        /* this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'book Created',
          life: 3000,
        }); */
      }

      this.books = [...this.books];
      this.bookDialog = false;
      this.book = {};
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
}
