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
import { ArrayOfImageToUpload } from 'src/app/interfaces/ArrayOfImageToUpload';
import { Author } from 'src/app/interfaces/author';
import { Book } from 'src/app/interfaces/book';
import { Editor } from 'src/app/interfaces/editor';
import { Format } from 'src/app/interfaces/format';
import { Image } from 'src/app/interfaces/image';
import { ImageToUpload } from 'src/app/interfaces/imageToUpload';
import { Taxe } from 'src/app/interfaces/taxe';
import { Type } from 'src/app/interfaces/type';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { EditorService } from 'src/app/services/editor.service';
import { FormatService } from 'src/app/services/format.service';
import { ImageService } from 'src/app/services/image.service';
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
  imageInfo: ImageToUpload = {};
  imageInfoList: ArrayOfImageToUpload = { images: [] };
  bookImageList: Array<Image> = [];
  imageTemp: Image = {};

  constructor(
    private router: Router,
    private bs: BookService,
    private fs: FormatService,
    private es: EditorService,
    private is: ImageService,
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
      JSON.parse(this.storageCrypter.getItem('adminUser', 'session'));
    } catch (error) {
      this.router.navigateByUrl('/admin/login');
    }
    this.bs.getAllBooksWithoutLimit([], [], '', [], null).subscribe((data) => {
      data.forEach((aBook) => {
        aBook.images?.sort(function (a, b) {
          if (typeof a.position == 'number' && typeof b.position == 'number') {
            if (a.position > b.position) {
              return 1;
            }
            if (a.position < b.position) {
              return -1;
            }
            return 0;
          } else {
            return 0;
          }
        });
      });
      this.allBooks = data;
    });
    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllTaxesfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
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
          aBook.images?.forEach((anImage) => {
            let imageUrlToDelete = {
              imageUrl: anImage.url?.substring(anImage.url?.indexOf('assets')),
            };

            this.is.deleteImageOfServer(imageUrlToDelete).subscribe((el) => {});
          });
          this.is.getAllImagesForABook(aBook.id ?? 0).subscribe((el) => {
            el.forEach((element) => {
              this.is.deleteImage(element.id).subscribe();
            });
            setTimeout(() => {
              this.bs.deleteTheBook(aBook.id).subscribe((el) => {
                this.book = {};
              });
            }, 500);
          });
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
        book.images?.forEach((anImage) => {
          let imageUrlToDelete = {
            imageUrl: anImage.url?.substring(anImage.url?.indexOf('assets')),
          };
          this.is.deleteImageOfServer(imageUrlToDelete).subscribe((el) => {});
        });
        this.is.getAllImagesForABook(book.id ?? 0).subscribe((el) => {
          el.forEach((element) => {
            this.is.deleteImage(element.id).subscribe();
          });
          setTimeout(() => {
            this.bs.deleteTheBook(book.id).subscribe((el) => {
              this.book = {};
            });
          }, 500);
        });

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
    this.imageInfoList.images = [];
  }

  saveBook() {
    this.submitted = true;
    let book = this.book;
    if (book.year) {
      book.year = book.year.toString();
    }
    if (book.id) {
      if (this.imageInfoList.images) {
        this.imageInfoList.images.forEach((anImageInfo) => {
          anImageInfo.bookId = book.id;

          if (anImageInfo.url) {
            anImageInfo.url =
              'https://www.thibaultmorizet.fr/assets/book-images/' +
              book.id +
              '/' +
              book.id +
              '-' +
              this.imageInfoList.images?.indexOf(anImageInfo) +
              '.' +
              anImageInfo.url.split('.').pop();
          } else {
            anImageInfo.url =
              'https://www.thibaultmorizet.fr/assets/book-images/' +
              book.id +
              '-' +
              this.imageInfoList.images?.indexOf(anImageInfo) +
              '/' +
              book.id +
              '.jpeg';
          }
        });

        this.is.getAllImagesForABook(book.id ?? 0).subscribe((el) => {
          el.forEach((element) => {
            this.is.deleteImage(element.id).subscribe();
          });
          if (this.imageInfoList.images) {
            book.images = [];
            this.imageInfoList.images.forEach((element) => {
              this.bs.getOneBook(element.bookId ?? 0).subscribe((el) => {
                delete el.author;
                delete el.type;
                delete el.format;
                delete el.editor;
                delete el.taxe;
                this.imageTemp = {
                  book: el,
                  url: element.url,
                  position: this.imageInfoList.images?.indexOf(element),
                };
                book.images?.push(this.imageTemp);
                this.is.createImage(this.imageTemp).subscribe();
              });
            });
            this.is.addImage(this.imageInfoList).subscribe((res) => {});
          }
        });
      }
      this.bs.updateBook(book.id, book).subscribe((result) => {
        this.imageInfoList.images = [];
        this.allBooks.forEach((aBook) => {
          if (aBook.id == book.id) {
            aBook.images = book.images;
          }
        });
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_books.book_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.bs.createBook(book).subscribe((res) => {
        if (this.imageInfoList.images) {
          this.imageInfoList.images.forEach((anImageInfo) => {
            anImageInfo.bookId = res.id;

            if (anImageInfo.url) {
              anImageInfo.url =
                'https://www.thibaultmorizet.fr/assets/book-images/' +
                res.id +
                '/' +
                res.id +
                '-' +
                this.imageInfoList.images?.indexOf(anImageInfo) +
                '.' +
                anImageInfo.url.split('.').pop();
            } else {
              anImageInfo.url =
                'https://www.thibaultmorizet.fr/assets/book-images/' +
                res.id +
                '-' +
                this.imageInfoList.images?.indexOf(anImageInfo) +
                '/' +
                res.id +
                '.jpeg';
            }
          });

          if (this.imageInfoList.images) {
            this.imageInfoList.images.forEach((element) => {
              this.bs.getOneBook(element.bookId ?? 0).subscribe((el) => {
                delete el.author;
                delete el.type;
                delete el.format;
                delete el.editor;
                delete el.taxe;
                this.imageTemp = {
                  book: el,
                  url: element.url,
                  position: this.imageInfoList.images?.indexOf(element),
                };
                book.images?.push(this.imageTemp);

                this.is.createImage(this.imageTemp).subscribe();
              });
            });
            this.is.addImage(this.imageInfoList).subscribe((res) => {});
          }
        }
        book.images?.sort(function (a, b) {
          if (typeof a.position == 'number' && typeof b.position == 'number') {
            if (a.position > b.position) {
              return 1;
            }
            if (a.position < b.position) {
              return -1;
            }
            return 0;
          } else {
            return 0;
          }
        });
        this.bs.updateBook(res.id, book).subscribe((result) => {
          this.imageInfoList.images = [];
          this.allBooks.push(book);
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

  clearImageListOfServer() {
    this.imageInfoList.images = [];
  }

  removeImageOfServer($event: any) {
    const file: File = $event.file as File;
    if (this.imageInfoList.images) {
      for (let index = 0; index < this.imageInfoList.images.length; index++) {
        if (this.imageInfoList.images[index].url == file.name) {
          this.imageInfoList.images.splice(index, 1);
        }
      }
    }
  }

  addImageToServer($event: any) {
    const currentFiles: FileList = $event.currentFiles as FileList;

    Array.from(currentFiles).forEach((file) => {
      this.imageInfo = {};
      const observable = new Observable((subscriber: Subscriber<any>) => {
        this.readFile(file, subscriber);
      });
      observable.subscribe((d) => {
        this.imageInfo = {
          url: file.name,
          data: d.substring(d.indexOf('base64,') + 7),
        };
        if (this.imageInfoList.images) {
          this.imageInfoList.images.push(this.imageInfo);
        }
      });
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
