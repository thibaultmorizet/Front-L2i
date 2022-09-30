import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
})
export class BookDetailsComponent implements OnInit {
  book: Book = {};
  idBook: number = 0;

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((res) => {
      this.idBook = +(res.get('id') ?? '0');
      this.bs.getOneBook(this.idBook).subscribe((b) => {
        this.book = b;
      });
    });
  }
  
  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }
}
