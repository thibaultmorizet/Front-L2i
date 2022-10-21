import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';
import { Editor } from 'src/app/interfaces/editor';
import { EditorService } from 'src/app/services/editor.service';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/interfaces/author';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: [
    './book.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class BookComponent implements OnInit {
  basket: Array<Book> = [];
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
  bookExistinBasket: Boolean = false;
  numberToOrder: string = '1';
  storageCrypter = new StorageCrypter('Secret');
  userInscription: User = {};
  userLogin: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  errorConnexion: string | null = null;
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
    private us: UserService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private modalService: NgbModal,
    private authService: SocialAuthService
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
      this.getUserByEmail(
        JSON.parse(this.storageCrypter.getItem('user', 'session')).email
      );
    } catch (error) {
      this.connectedUser = null;
    }
    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
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

  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      this.storageCrypter.setItem('user', JSON.stringify(res[0]), 'session');
      this.connectedUser = res[0];
    });
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
  addBookToBasket(event: any, bookId: number | undefined) {
    this.numberToOrder = event.target.querySelector('select').value;

    this.bookExistinBasket = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.basket.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinBasket = true;

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
                if (el.unitprice) {
                  el.totalprice = parseFloat(
                    (el.number_ordered * el.unitprice).toFixed(2)
                  );
                }
                this.iziToast.success({
                  message: 'Article ajouté au panier',
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'basket',
                  JSON.stringify(this.basket),
                  'local'
                );
              }
            }
          }
        });

        if (!this.bookExistinBasket) {
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
            if (res.unitprice) {
              res.totalprice = parseFloat(
                (res.number_ordered * res.unitprice).toFixed(2)
              );
            }

            this.basket.push(res);
            this.iziToast.success({
              message: 'Article ajouté au panier',
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        }
      });
    }
  }
  registerModal(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          if (reason == 0 || reason == 'Cross click') {
            this.userInscription = {};
          }
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  loginModal(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          if (reason == 0 || reason == 'Cross click') {
            this.userLogin = {};
          }
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  updatebookModal(content: any, id: number | undefined) {
    if (id != undefined) {
      this.bs.getOneBook(id).subscribe((b) => {
        this.actualUpdatebook = b;

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
      });
    }
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
  register() {
    if (this.userInscription.password == this.userInscription.passwordConfirm) {
      this.errorPassword = '';

      //delete this.userInscription.passwordConfirm;
      this.us.getTheUser(this.userInscription.email).subscribe((res) => {
        if (res[0] == undefined) {
          this.errorEmail = '';

          this.us.register(this.userInscription).subscribe((resRegister) => {
            this.modalService.dismissAll();
            this.userInscription = {};
            this.iziToast.success({
              message: 'Inscription réussie',
              position: 'topRight',
            });
          });
        } else {
          this.errorEmail = 'Cet email est déjà utilisé';
        }
      });
    } else {
      this.errorPassword = 'Les mots de passes ne sont pas identiques';
    }
  }
  login() {
    this.as.login(this.userLogin).subscribe({
      next: (res) => {
        if (res.token != null) {
          this.storageCrypter.setItem('jeton', res.token, 'local');

          this.as.getTheUser(this.userLogin.email).subscribe((res) => {
            this.storageCrypter.setItem(
              'user',
              JSON.stringify(res[0]),
              'session'
            );

            this.connectedUser = res[0];
            this.modalService.dismissAll();
            this.userLogin = {};
            this.iziToast.success({
              message: 'Connexion réussie',
              position: 'topRight',
            });
          });
        }
      },
      error: (res) => {
        this.errorConnexion = res.message;
      },
    });
  }
  updatebook() {
    if (this.connectedUser?.roles?.includes('ROLE_ADMIN')) {
      this.es
        .getEditorByName(this.actualUpdatebook.editor?.name)
        .subscribe((resGetEditor) => {
          if (resGetEditor[0]) {
            this.actualUpdatebook.editor = resGetEditor[0];
          }
        });

      this.fs
        .getFormatByName(this.actualUpdatebook.format?.name)
        .subscribe((resGetFormat) => {
          if (resGetFormat[0]) {
            this.actualUpdatebook.format = resGetFormat[0];
          }
        });
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

      setTimeout(() => {
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
      }, 1000);
    } else {
      this.iziToast.error({
        message: "Impossible de modifier un livre si vous n'êtes pas admin",
        position: 'topRight',
      });
    }
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  refreshTokenAuth(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
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
    if (this.fileToUpload) {
      this.bs.uploadCoverImage(this.fileToUpload).subscribe(resp => {
        alert("Uploaded")
      })
    } else {
      alert("Please select a file first")
    }
  }
}
