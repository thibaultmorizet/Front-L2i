import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';
import { Type } from 'src/app/interfaces/type';
import { TypeService } from 'src/app/services/type.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnInit {
  basketCount: number = 0;
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

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private ts: TypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.getAllBooks();
    this.getAllFormatsfunc();
    this.getAllTypesfunc();
    this.setPaginationArray();
  }
  getBooks() {
    this.bs.getAllBooks().subscribe((res) => {
      this.books = res;
    });
  }
  getAllBooks(formatFilter: Array<string> = [],typeFilter: Array<string> = [], searchText: string = '') {
    this.bs
      .getAllBooksWithoutLimit(formatFilter,typeFilter, searchText)
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
}
