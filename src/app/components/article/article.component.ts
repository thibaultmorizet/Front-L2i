import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from 'src/app/interfaces/article';
import { ArticleService } from 'src/app/services/article.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent implements OnInit {
  articles: Array<Article> = [];
  pageCount: number = 0;
  user: User = {};

  constructor(
    private as: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.as.getAllArticles().subscribe((res) => {
      this.articles = res;
      this.pageCount = res.length;
      console.log(this.pageCount);
      
    });
  }

  goToArticles() {
    this.router.navigateByUrl('/articles');
  }
}
