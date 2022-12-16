import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
import { Taxe } from 'src/app/interfaces/taxe';
import { Type } from 'src/app/interfaces/type';
import { User } from 'src/app/interfaces/user';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { EditorService } from 'src/app/services/editor.service';
import { FormatService } from 'src/app/services/format.service';
import { TaxeService } from 'src/app/services/taxe.service';
import { TypeService } from 'src/app/services/type.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminBooksComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  bookDialog: boolean = false;
  allBooks: Book[] = [];
  book: Book = {};
  selectedBooks: Book[] = [];
  submitted: boolean = false;
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  taxes: Array<Taxe> = [];
  authors: Array<Author> = [];
  types: Array<Type> = [];
  imageInfo: Image = {};

  constructor(
    private router: Router,
    private bs: BookService,
    private fs: FormatService,
    private es: EditorService,
    private taxeService: TaxeService,
    private ts: TypeService,
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
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = null;
      this.router.navigateByUrl('/admin/login');
    }

    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.adminLogout();
      }
    }

    this.bs
      .getAllBooksWithoutLimit([], [], '', [], null)
      .subscribe((data) => (this.allBooks = data));

    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllTaxesfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  adminLogout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedAdmin = null;
    this.router.navigateByUrl('/admin/login');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }
  openNew() {
    this.book = {
      unitpriceht: 1,
      stock: 1,
      year: '1850',
    };
    this.submitted = false;
    this.bookDialog = true;
  }

  deleteSelectedBooks() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_books.confirm_group_delete_books_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allBooks = this.allBooks.filter(
          (val) => !this.selectedBooks.includes(val)
        );
        this.selectedBooks.forEach((aBook) => {
          let imageUrlToDelete = {
            imageUrl: aBook.image?.substring(aBook.image?.indexOf('assets')),
          };

          this.bs.deleteImage(imageUrlToDelete).subscribe((el) => {});

          this.bs.deleteTheBook(aBook.id).subscribe((el) => {});
        });
        this.selectedBooks = [];
        this.iziToast.success({
          message: this.translate.instant('admin_books.books_deleted'),
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
    console.log(this.book);
  }

  deletebook(book: Book) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_books.confirm_delete_book_message',
        { title: book.title }
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allBooks = this.allBooks.filter((val) => val.id !== book.id);
        let imageUrlToDelete = {
          imageUrl: book.image?.substring(book.image?.indexOf('assets')),
        };

        this.bs.deleteImage(imageUrlToDelete).subscribe((el) => {});
        this.bs.deleteTheBook(book.id).subscribe((el) => {});
        this.book = {};

        this.iziToast.success({
          message: this.translate.instant('admin_books.book_deleted'),
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
      if (this.imageInfo.data) {
        this.imageInfo.bookId = this.book.id?.toString();

        if (this.imageInfo.url) {
          this.book.image =
            'https://www.thibaultmorizet.fr/assets/book-images/' +
            this.book.id +
            '.' +
            this.imageInfo.url.split('.').pop();
        } else {
          this.book.image =
            'https://www.thibaultmorizet.fr/assets/book-images/' + this.book.id + '.jpeg';
        }
        this.bs.addImage(this.imageInfo).subscribe();
      }
      this.bs.updateBook(this.book.id, this.book).subscribe((result) => {
        this.book = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_books.book_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allBooks.push(this.book);
      this.bs.createBook(this.book).subscribe((res) => {
        if (this.imageInfo.data) {
          this.imageInfo.bookId = res.id?.toString();
          if (this.imageInfo.url) {
            this.book.image =
              'https://www.thibaultmorizet.fr/assets/book-images/' +
              res.id +
              '.' +
              this.imageInfo.url.split('.').pop();
          } else {
            this.book.image =
              'https://www.thibaultmorizet.fr/assets/book-images/' + res.id + '.jpeg';
          }

          this.bs.addImage(this.imageInfo).subscribe();
        }
        this.bs.updateBook(res.id, this.book).subscribe((result) => {
          this.book = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_books.book_created'),
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
  getAllTaxesfunc() {
    this.taxeService.getAllTaxes().subscribe((res) => {
      res.forEach((aTaxe) => {
        delete aTaxe.books;
      });
      this.taxes = res;
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

  getUnitpricettcFromUnitpricehtAndTva(
    unitpriceht: number | undefined,
    tva: number | undefined
  ) {
    if (unitpriceht != undefined) {
      if (tva != undefined) {
        return (unitpriceht + (tva * unitpriceht) / 100).toFixed(2);
      } else {
        return unitpriceht.toFixed(2);
      }
    } else {
      return null;
    }
  }
}
