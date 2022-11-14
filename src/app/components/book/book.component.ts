import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SocialAuthService, SocialUser } from 'angularx-social-login';

import { Editor } from 'src/app/interfaces/editor';
import { EditorService } from 'src/app/services/editor.service';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/interfaces/author';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css', './../../../css/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BookComponent implements OnInit {
  cart: Array<Book> = [];
  books: Array<Book> = [];
  allBooks: Array<Book> = [];
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  authors: Array<Author> = [];
  types: Array<Type> = [];
  user: User = {};
  searchBook: any = {};
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
  pageRows: number = 12;

  selectedFormat: Array<Format> = [];
  selectedType: Array<Type> = [];
  selectedPriceRange: Array<number> = [0, 0];
  showBooksInStock: boolean = true;
  filteredBooks: Array<Book> = [];
  maxPrice: number = 0;

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
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.bs.getAllBooksWithoutLimit([], [], '', [], true).subscribe((res) => {
      res.forEach((aBook) => {
        if (
          aBook.unitpricettc &&
          (aBook.unitpricettc > this.selectedPriceRange[1] ||
            this.selectedPriceRange[1] == undefined)
        ) {
          this.maxPrice = aBook.unitpricettc;
          this.selectedPriceRange = [0, aBook.unitpricettc];
        }
      });
    });
    this.getBooks();
    this.getAllBooks();
    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
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
        this.logout();
      }
    }

    this.fileToUpload = {};
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }
  getBooks() {
    this.bs.getAllBooks(this.showBooksInStock).subscribe((res) => {
      this.books = res;
    });
  }
  getAllBooks(
    formatFilter: Array<Format> = [],
    typeFilter: Array<Type> = [],
    searchBook: string = '',
    prices: Array<number> = []
  ) {
    this.bs
      .getAllBooksWithoutLimit(
        formatFilter,
        typeFilter,
        searchBook,
        prices,
        this.showBooksInStock
      )
      .subscribe((res) => {
        this.allBooks = res;
        this.filteredBooks = res;
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
  getAllBooksByPage(event: any) {
    this.bs
      .getAllBooksForPage(
        event.page + 1,
        event.rows,
        this.selectedFormat,
        this.selectedType,
        this.searchBook?.title ?? this.searchBook,
        this.selectedPriceRange,
        this.showBooksInStock
      )
      .subscribe((res) => {
        this.books = res;
        this.pageRows = event.rows;
      });
  }
  getBooksWithFormatAndTypeAndPriceAndSearch() {
    this.bs
      .getAllBooksByFormatAndTypeAndSearch(
        this.selectedFormat,
        this.selectedType,
        this.searchBook?.title ?? this.searchBook,
        this.selectedPriceRange,
        this.pageRows,
        this.showBooksInStock
      )
      .subscribe((res) => {
        this.books = res;
        this.bs
          .getAllBooksByFormatAndTypeAndSearch(
            this.selectedFormat,
            this.selectedType,
            this.searchBook?.title ?? this.searchBook,
            this.selectedPriceRange,
            10000,
            this.showBooksInStock
          )
          .subscribe((el) => {
            this.filteredBooks = el;
          });
      });
  }
  addBookToCart(bookId: number | undefined) {
    this.bookExistinCart = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.cart.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinCart = true;

            if (
              el.stock &&
              el.number_ordered &&
              el.number_ordered + 1 > el.stock
            ) {
              this.iziToast.error({
                title: 'Lack of stock',
                message:
                  'There are ' +
                  res.stock +
                  ' copies of the book ' +
                  res.title +
                  ' left and you are requesting ' +
                  (el.number_ordered + 1),
                position: 'topRight',
              });
            } else {
              if (el.number_ordered != undefined) {
                el.number_ordered = el.number_ordered + 1;
                if (el.unitpricettc) {
                  el.totalpricettc = parseFloat(
                    (el.number_ordered * el.unitpricettc).toFixed(2)
                  );
                }
                if (el.unitpriceht) {
                  el.totalpriceht = parseFloat(
                    (el.number_ordered * el.unitpriceht).toFixed(2)
                  );
                }
                this.iziToast.success({
                  message: 'Book add to cart',
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
          if (res.stock && 1 > res.stock) {
            this.iziToast.error({
              title: 'Lack of stock',
              message:
                'There are ' +
                res.stock +
                ' copies of the book ' +
                res.title +
                ' left and you are requesting ' +
                1,
              position: 'topRight',
            });
          } else {
            res.number_ordered = 1;
            if (res.unitpricettc) {
              res.totalpricettc = parseFloat(
                (res.number_ordered * res.unitpricettc).toFixed(2)
              );
            }
            if (res.unitpriceht) {
              res.totalpriceht = parseFloat(
                (res.number_ordered * res.unitpriceht).toFixed(2)
              );
            }

            this.cart.push(res);
            this.iziToast.success({
              message: 'Book add to cart',
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
            message: 'Modification confirm',
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
      message: "you're logout",
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
  filterBook(event: any) {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.allBooks.length; i++) {
      let book = this.allBooks[i];
      if (
        book.title &&
        book.title.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(book);
      } else if (book.author) {
        book.author.forEach((anAuthor) => {
          if (
            (anAuthor.firstname &&
              anAuthor.firstname.toLowerCase().indexOf(query.toLowerCase()) ==
                0) ||
            (anAuthor.lastname &&
              anAuthor.lastname.toLowerCase().indexOf(query.toLowerCase()) == 0)
          ) {
            filtered.push(book);
          }
        });
      }
    }

    this.filteredBooks = filtered;
  }

  updateShowBooksInStock() {
    this.showBooksInStock = !this.showBooksInStock;
    this.getBooksWithFormatAndTypeAndPriceAndSearch();
  }

  clearAllFilter() {
    this.selectedFormat = [];
    this.selectedType = [];
    this.selectedPriceRange = [0, this.maxPrice];
    this.showBooksInStock = true;
    this.searchBook = null;
    this.getBooksWithFormatAndTypeAndPriceAndSearch();
  }
}
