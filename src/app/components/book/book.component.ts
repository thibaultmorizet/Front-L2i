import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnInit {
  books: Array<Book> = [];
  allBooks: Array<Book> = [];
  formats: Array<Format> = [];
  totalBooksCount: number = 0;
  pageCount: number = 0;
  user: User = {};
  paginationArray: Array<number> = [];
  actualPage: number = 1;
  formatFilter: Array<string> = [];
  searchText: string = '';

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.getAllBooks();
    this.getAllFormatsfunc();
    this.setPaginationArray();
  }
  getBooks() {
    this.bs.getAllBooks().subscribe((res) => {
      this.books = res;
    });
  }
  getAllBooks(formatFilter: Array<string> = [], searchText: string = '') {
    this.bs
      .getAllBooksWithoutLimit(formatFilter, searchText)
      .subscribe((res) => {
        this.allBooks = res;
      });
  }
  setPaginationArray(
    formatFilter: Array<string> = [],
    searchText: string = ''
  ) {
    this.bs
      .getAllBooksWithoutLimit(formatFilter, searchText)
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

  getAllBooksByPage(page: number) {
    this.bs
      .getAllBooksForPage(page, this.formatFilter, this.searchText)
      .subscribe((res) => {
        this.books = res;
        this.actualPage = page;
      });
  }

  getBooksWithFormatAndSearch() {
    this.formatFilter = [];

    this.formats.forEach((el) => {
      if (el.filter_is_selected && el.format_name != undefined) {
        this.formatFilter.push(el.format_name);
      }
    });
    this.bs
      .getAllBooksByFormatAndSearch(this.formatFilter, this.searchText)
      .subscribe((res) => {
        this.books = res;
        this.setPaginationArray(this.formatFilter,this.searchText);
      });
  }

}
