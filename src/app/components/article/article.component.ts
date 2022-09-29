import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from 'src/app/interfaces/article';
import { ArticleService } from 'src/app/services/article.service';
import { FormatService } from 'src/app/services/format.service';
import { User } from 'src/app/interfaces/user';
import { Format } from 'src/app/interfaces/format';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent implements OnInit {
  articles: Array<Article> = [];
  formats: Array<Format> = [];
  TotalArticlesCount: number = 0;
  ArticlesStockCount: number = 0;
  pageCount: number = 0;
  user: User = {};
  arr: Array<number> = [];
  actualPage: number = 1;
  inStock: Boolean = false;
  formatFilter: Array<string> = [];

  constructor(
    private as: ArticleService,
    private fs: FormatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.as.getAllArticles().subscribe((res) => {
      this.articles = res;
    });
    this.getAllFormatsfunc();
    this.as.getAllArticlesWithoutLimit().subscribe((res) => {
      this.pageCount = Math.round(res.length / 9);
      this.TotalArticlesCount = res.length;
      for (let index = 0; index < this.pageCount; index++) {
        this.arr.push(index + 1);
      }

      this.actualPage = 1;
    });
  }
  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      res.forEach((el) => {
        el.filter_is_selected = false;
        if (el.articles != undefined) {
          el.articles.forEach((anArticle) => {
            if (el.count_articles != undefined) {
              el.count_articles++;
            } else {
              el.count_articles = 1;
            }
          });
        }
      });
      this.formats = res;
    });
  }
  goToArticles() {
    this.router.navigateByUrl('/articles');
  }
  getAllArticlesByPage(page: number) {
    this.as.getAllArticlesForPage(page, this.formatFilter).subscribe((res) => {
      this.articles = res;
      this.actualPage = page;
    });
  }
  getPreviousPage() {
    if (this.actualPage - 1 >= 1) {
      this.getAllArticlesByPage(this.actualPage - 1);
    }
  }
  getNextPage() {
    if (this.actualPage + 1 <= this.pageCount) {
      this.getAllArticlesByPage(this.actualPage + 1);
    }
  }

  removeFormatFilter() {
    this.getAllFormatsfunc();
    this.formatFilter=[];
    this.getAllArticlesByPage(1);
  }

  getArticlesWithFormat() {
    this.formatFilter = [];
    console.log(this.formatFilter);

    this.actualPage = 1;
    this.formats.forEach((el) => {
      if (el.filter_is_selected && el.format_name != undefined) {
        this.formatFilter.push(el.format_name);
      }
    });
    this.as.getAllArticlesByFormat(this.formatFilter).subscribe((res) => {
      this.articles = res;
    });
  }
}
