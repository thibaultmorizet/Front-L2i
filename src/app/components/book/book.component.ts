import { Component, OnInit } from '@angular/core';
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
  formats: Array<Format> = [];
  totalBooksCount: number = 0;
  pageCount: number = 0;
  user: User = {};
  paginationArray: Array<number> = [];
  actualPage: number = 1;
  formatFilter: Array<string> = [];

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bs.getAllBooks().subscribe((res) => {
      this.books = res;
    });
    this.getAllFormatsfunc();
    this.setPaginationArray();
  }
  setPaginationArray(formatFilter: Array<string> = []) {
    this.bs.getAllBooksWithoutLimit(formatFilter).subscribe((res) => {
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
  goToBooks() {
    this.router.navigateByUrl('/books');
  }
  goToBookDetails(id: number) {
    this.router.navigateByUrl('/books/' + id);
  }
  getAllBooksByPage(page: number) {
    this.bs.getAllBooksForPage(page, this.formatFilter).subscribe((res) => {
      this.books = res;
      this.actualPage = page;
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

  getBooksWithFormat() {
    this.formatFilter = [];

    this.formats.forEach((el) => {
      if (el.filter_is_selected && el.format_name != undefined) {
        this.formatFilter.push(el.format_name);
      }
    });
    this.bs.getAllBooksByFormat(this.formatFilter).subscribe((res) => {
      this.books = res;
    });
    this.setPaginationArray(this.formatFilter);
  }
}
