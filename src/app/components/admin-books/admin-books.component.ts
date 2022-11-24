import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Observable, Subscriber } from 'rxjs';
import { Author } from 'src/app/interfaces/author';
import { Book } from 'src/app/interfaces/book';
import { Editor } from 'src/app/interfaces/editor';
import { Format } from 'src/app/interfaces/format';
import { Image } from 'src/app/interfaces/image';
import { Type } from 'src/app/interfaces/type';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { EditorService } from 'src/app/services/editor.service';
import { FormatService } from 'src/app/services/format.service';
import { TypeService } from 'src/app/services/type.service';

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
  updatedFormat: Format = {};
  updatedEditor: Editor = {};
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  authors: Array<Author> = [];
  types: Array<Type> = [];
  selectedAuthors: Array<Author> = [];
  selectedTypes: Array<Type> = [];
  selectedFormat: Format = {};
  selectedEditor: Editor = {};
  imageInfo: Image = {};

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private es: EditorService,
    private ts: TypeService,
    private authorService: AuthorService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.bs
      .getAllBooksWithoutLimit([], [], '', [], null)
      .subscribe((data) => (this.allBooks = data));
    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
  }

  openNew() {
    this.book = {};
    this.submitted = false;
    this.bookDialog = true;
  }

  deleteSelectedBooks() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected books ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allBooks = this.allBooks.filter(
          (val) => !this.selectedBooks.includes(val)
        );
        this.selectedBooks.forEach((aBook) => {
          this.bs.deleteTheBook(aBook.id).subscribe((el) => {});
        });
        this.selectedBooks = [];
        this.iziToast.success({
          message: 'Books deleted',
          position: 'topRight',
        });
      },
    });
  }

  editBook(book: Book) {
    book.author?.forEach((anAuthor) => {
      anAuthor.name = anAuthor.firstname + ' ' + anAuthor.lastname;
    });
    this.book = { ...book };
    this.bookDialog = true;
  }

  deletebook(book: Book) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + book.title + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allBooks = this.allBooks.filter((val) => val.id !== book.id);
        this.bs.deleteTheBook(book.id).subscribe((el) => {});
        this.book = {};
        this.iziToast.success({
          message: 'Book deleted',
          position: 'topRight',
        });
      },
    });
  }

  hideDialog() {
    this.bookDialog = false;
    this.submitted = false;
  }

  saveBook() {
    this.submitted = true;

    if (this.book.year) {
      this.book.year = this.book.year.toString();
    }
    if (this.book.id) {
      this.imageInfo.bookId = this.book.id?.toString();

      if (this.imageInfo.url) {
        this.book.image =
          'https://www.thibaultmorizet.fr/assets/' +
          this.book.id +
          '.' +
          this.imageInfo.url.split('.').pop();
      } else {
        this.book.image =
          'https://www.thibaultmorizet.fr/assets/' + this.book.id + '.jpeg';
      }
      if (this.imageInfo.data) {
        this.bs.addImage(this.imageInfo).subscribe();
      }
      this.bs.updateBook(this.book.id, this.book).subscribe((result) => {
        this.book = {};
        this.ngOnInit();
        this.iziToast.success({
          message: 'Book updated',
          position: 'topRight',
        });
      });
    } else {
      this.allBooks.push(this.book);
      this.bs.createBook(this.book).subscribe((res) => {
        this.imageInfo.bookId = res.id?.toString();
        if (this.imageInfo.url) {
          this.book.image =
            'https://www.thibaultmorizet.fr/assets/' +
            res.id +
            '.' +
            this.imageInfo.url.split('.').pop();
        } else {
          this.book.image =
            'https://www.thibaultmorizet.fr/assets/' + res.id + '.jpeg';
        }
        if (this.imageInfo.data) {
          this.bs.addImage(this.imageInfo).subscribe();
        }
        this.bs.updateBook(res.id, this.book).subscribe((result) => {
          this.book = {};
          this.ngOnInit();
          this.iziToast.success({
            message: 'Book created',
            position: 'topRight',
          });
        });
      });
    }

    this.allBooks = [...this.allBooks];
    this.bookDialog = false;
    this.book = {};
  }

  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      res.forEach((aFormat) => {
        delete aFormat.books;
      });
      this.formats = res;
    });
  }
  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      res.forEach((anEditor) => {
        delete anEditor.books;
      });
      this.editors = res;
    });
  }
  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      res.forEach((anAuthor) => {
        delete anAuthor.books;
        anAuthor.name = anAuthor.firstname + ' ' + anAuthor.lastname;
      });
      this.authors = res;
    });
  }
  getAllTypesfunc() {
    this.ts.getAllTypes().subscribe((res) => {
      res.forEach((aType) => {
        delete aType.books;
      });
      this.types = res;
    });
  }

  addImageToServer($event: Event) {
    const target = $event.target as HTMLInputElement;

    const file: File = (target.files as FileList)[0];

    this.imageInfo = {
      url: file.name,
      bookId: '5',
    };

    this.convertToBase64(file);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      this.imageInfo.data = d.substring(d.indexOf('base64,') + 7);
    });
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    };
  }
}
