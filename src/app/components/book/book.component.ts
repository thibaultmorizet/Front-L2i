import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';
import { Type } from 'src/app/interfaces/type';
import { TypeService } from 'src/app/services/type.service';
import StorageCrypter from 'storage-crypter';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { SocialAuthService, SocialUser } from 'angularx-social-login';

import { Editor } from 'src/app/interfaces/editor';
import { EditorService } from 'src/app/services/editor.service';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/interfaces/author';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css', './../../../css/main.css'],
})
export class BookComponent implements OnInit {
  cart: Array<Book> = [];
  books: Array<Book> = [];
  allBooks: Array<Book> = [];
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  authors: Array<Author> = [];
  types: Array<Type> = [];
  totalBooksCount: number = 0;
  pageCount: number = 0;
  user: User = {};
  paginationArray: Array<number> = [];
  actualPage: number = 1;
  formatFilter: Array<string> = [];
  typeFilter: Array<string> = [];
  searchText: string = '';
  bookExistinCart: Boolean = false;
  numberToOrder: string = '1';
  storageCrypter = new StorageCrypter('Secret');
  userInscription: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  connectedUser: User | null = {};
  actualUpdatebook: Book = {};
  fileToUpload: any = {};

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private es: EditorService,
    private authorService: AuthorService,
    private ts: TypeService,
    private as: AuthService,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private modalService: NgbModal,
    private authService: SocialAuthService,
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.getAllBooks();
    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
    this.setPaginationArray();
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.refreshToken();
      }
    }
    this.fileToUpload = {};
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  getBooks() {
    this.bs.getAllBooks().subscribe((res) => {
      this.books = res;
    });
  }
  getAllBooks(
    formatFilter: Array<string> = [],
    typeFilter: Array<string> = [],
    searchText: string = ''
  ) {
    this.bs
      .getAllBooksWithoutLimit(formatFilter, typeFilter, searchText)
      .subscribe((res) => {
        this.allBooks = res;
      });
  }
  setPaginationArray(
    formatFilter: Array<string> = [],
    typeFilter: Array<string> = [],
    searchText: string = ''
  ) {
    this.bs
      .getAllBooksWithoutLimit(formatFilter, typeFilter, searchText)
      .subscribe((res) => {
        this.pageCount = Math.ceil(res.length / 9);
        this.totalBooksCount = res.length;
        this.paginationArray = [];

        for (let index = 0; index < this.pageCount; index++) {
          this.paginationArray.push(index + 1);
        }
        this.actualPage = 1;
      });
  }
  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      res.forEach((el) => {
        el.filter_is_selected = false;
        if (el.books != undefined) {
          el.books.forEach((aBook) => {
            if (el.count_books != undefined) {
              el.count_books++;
            } else {
              el.count_books = 1;
            }
          });
        }
      });

      this.formats = res;
    });
  }
  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      this.editors = res;
    });
  }
  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      this.authors = res;
    });
  }
  getAllTypesfunc() {
    this.ts.getAllTypes().subscribe((res) => {
      res.forEach((el) => {
        el.filter_is_selected = false;
        if (el.books != undefined) {
          el.books.forEach((aBook) => {
            if (el.count_books != undefined) {
              el.count_books++;
            } else {
              el.count_books = 1;
            }
          });
        }
      });

      this.types = res;
    });
  }
  getPreviousPage() {
    if (this.actualPage - 1 >= 1) {
      this.getAllBooksByPage(this.actualPage - 1);
    }
  }
  getNextPage() {
    if (this.actualPage + 1 <= this.pageCount) {
      this.getAllBooksByPage(this.actualPage + 1);
    }
  }
  removeFormatFilter() {
    this.getAllFormatsfunc();
    this.formatFilter = [];
    this.getAllBooksByPage(1);
  }
  removeTypeFilter() {
    this.getAllTypesfunc();
    this.typeFilter = [];
    this.getAllBooksByPage(1);
  }
  getAllBooksByPage(page: number) {
    this.bs
      .getAllBooksForPage(
        page,
        this.formatFilter,
        this.typeFilter,
        this.searchText
      )
      .subscribe((res) => {
        this.books = res;
        this.actualPage = page;
      });
  }
  getBooksWithFormatAndTypeAndSearch() {
    this.formatFilter = [];
    this.typeFilter = [];

    this.formats.forEach((el) => {
      if (el.filter_is_selected && el.name != undefined) {
        this.formatFilter.push(el.name);
      }
    });
    this.types.forEach((el) => {
      if (el.filter_is_selected && el.name != undefined) {
        this.typeFilter.push(el.name);
      }
    });
    this.bs
      .getAllBooksByFormatAndTypeAndSearch(
        this.formatFilter,
        this.typeFilter,
        this.searchText
      )
      .subscribe((res) => {
        this.books = res;
        this.setPaginationArray(
          this.formatFilter,
          this.typeFilter,
          this.searchText
        );
      });
  }
  addBookToCart(event: any, bookId: number | undefined) {
    this.numberToOrder = event.target.querySelector('select').value;

    this.bookExistinCart = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              el.number_ordered + parseInt(this.numberToOrder) > el.stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.number_ordered + parseInt(this.numberToOrder)),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered =
                  el.number_ordered + parseInt(this.numberToOrder);
                if (el.unitpricettc) {
                  el.totalpricettc = parseFloat(
                    (el.number_ordered * el.unitpricettc).toFixed(2)
                  );
                }
                this.iziToast.success({
                  message: 'Article ajouté au panier',
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'cart',
                  JSON.stringify(this.cart),
                  'local'
                );
              }
            }
          }
        });

        if (!this.bookExistinCart) {
          if (res.stock && parseInt(this.numberToOrder) > res.stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.stock +
                ' exemplaires de ce livre et vous en demandez ' +
                parseInt(this.numberToOrder),
              position: 'topRight',
            });
          } else {
            res.number_ordered = parseInt(this.numberToOrder);
            if (res.unitpricettc) {
              res.totalpricettc = parseFloat(
                (res.number_ordered * res.unitpricettc).toFixed(2)
              );
            }

            this.cart.push(res);
            this.iziToast.success({
              message: 'Article ajouté au panier',
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'cart',
              JSON.stringify(this.cart),
              'local'
            );
          }
        }
      });
    }
  }
  updatebookModal(content: any, id: number | undefined) {
    if (id != undefined) {
      this.bs.getOneBook(id).subscribe((b) => {
        this.actualUpdatebook = b;
        this.formats.forEach((aFormat) => {
          if (this.actualUpdatebook.format) {
            if (this.actualUpdatebook.format.id == aFormat.id) {
              aFormat = this.actualUpdatebook.format;
            }
          }
        });
        this.editors.forEach((anEditor) => {
          if (this.actualUpdatebook.editor) {
            if (this.actualUpdatebook.editor.id == anEditor.id) {
              anEditor = this.actualUpdatebook.editor;
            }
          }
        });
        this.authors.forEach((anAuthor) => {
          if (
            this.actualUpdatebook.author &&
            this.actualUpdatebook.author.length > 0
          ) {
            this.actualUpdatebook.author.forEach((aBookAuthor) => {
              if (anAuthor.id == aBookAuthor.id) {
                anAuthor.isChecked = true;
              } else {
                anAuthor.isChecked = false;
              }
            });
          } else {
            anAuthor.isChecked = false;
          }
        });
        this.types.forEach((aType) => {
          aType.isChecked = false;
          if (
            this.actualUpdatebook.type &&
            this.actualUpdatebook.type.length > 0
          ) {
            this.actualUpdatebook.type.forEach((aBookType) => {
              if (aType.id == aBookType.id) {
                aType.isChecked = true;
              }
            });
          } else {
            aType.isChecked = false;
          }
        });
        this.modalService
          .open(content, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(
            (result) => {
              this.closeResult = `Closed with: ${result}`;
            },
            (reason) => {
              if (reason == 0 || reason == 'Cross click') {
                this.actualUpdatebook = {};
              }
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            }
          );
        setTimeout(() => {
          if (this.actualUpdatebook.format?.name) {
            document.getElementById(this.actualUpdatebook.format.name)?.click();
          }
          if (this.actualUpdatebook.editor?.name) {
            document.getElementById(this.actualUpdatebook.editor.name)?.click();
          }
        }, 500);
      });
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  updatebook() {
    if (this.connectedUser?.roles?.includes('ROLE_ADMIN')) {
      this.actualUpdatebook.type = [];
      this.types.forEach((aType) => {
        if (aType.isChecked) {
          this.actualUpdatebook.type?.push(aType);
        }
      });
      this.actualUpdatebook.author = [];
      this.authors.forEach((anAuthor) => {
        if (anAuthor.isChecked) {
          this.actualUpdatebook.author?.push(anAuthor);
        }
      });

      this.bs
        .updateBook(this.actualUpdatebook.id, this.actualUpdatebook)
        .subscribe((res) => {
          this.actualUpdatebook = {};
          this.modalService.dismissAll();
          this.ngOnInit();
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });
        });
    } else {
      this.iziToast.error({
        message: "Impossible de modifier un livre si vous n'êtes pas admin",
        position: 'topRight',
      });
    }
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  refreshToken() {
    if (!this.storageCrypter.getItem('user', 'session')) {
      this.storageCrypter.removeItem('jeton', 'local');
    }

    this.as
      .login(JSON.parse(this.storageCrypter.getItem('user', 'session')))
      .subscribe({
        next: (res) => {
          if (res.token != null) {
            this.storageCrypter.setItem('jeton', res.token, 'local');
          }
        },
        error: (res) => {
          this.logout();
        },
      });
  }
  uploadFile(file: any) {
    this.fileToUpload = file.files[0];
    /*  if (this.fileToUpload) {
      this.bs.uploadCoverImage(this.fileToUpload).subscribe(resp => {
        alert("Uploaded")
      })
    } else {
      alert("Please select a file first")
    } */
  }
}
