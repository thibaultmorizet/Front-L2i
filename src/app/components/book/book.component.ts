import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';
import { Type } from 'src/app/interfaces/type';
import { TypeService } from 'src/app/services/type.service';
import StorageCrypter from 'storage-crypter';
import { NgxIzitoastService } from 'ngx-izitoast';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnInit {
  basket: Array<Book> = [];
  books: Array<Book> = [];
  allBooks: Array<Book> = [];
  formats: Array<Format> = [];
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

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private ts: TypeService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.getAllBooks();
    this.getAllFormatsfunc();
    this.getAllTypesfunc();
    this.setPaginationArray();

    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));      
    }
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
  goToBookDetails(id: number) {
    this.router.navigateByUrl('/books/' + id);
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
      if (el.filter_is_selected && el.format_name != undefined) {
        this.formatFilter.push(el.format_name);
      }
    });
    this.types.forEach((el) => {
      if (el.filter_is_selected && el.type_name != undefined) {
        this.typeFilter.push(el.type_name);
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
              el.book_stock &&
              el.book_number_ordered &&
              el.book_number_ordered + parseInt(this.numberToOrder) >
                el.book_stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.book_stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.book_number_ordered + parseInt(this.numberToOrder)),
                position: 'topRight',
              });
            } else {
              if (el.book_number_ordered != undefined) {
                el.book_number_ordered =
                  el.book_number_ordered + parseInt(this.numberToOrder);
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
          if (res.book_stock && parseInt(this.numberToOrder) > res.book_stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.book_stock +
                ' exemplaires de ce livre et vous en demandez ' +
                parseInt(this.numberToOrder),
              position: 'topRight',
            });
          } else {
            res.book_number_ordered = parseInt(this.numberToOrder);
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
}
