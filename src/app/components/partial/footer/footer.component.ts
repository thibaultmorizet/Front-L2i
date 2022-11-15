import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  path: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.translate.getDefaultLang());
    this.activatedRoute.url.subscribe((el) => {
      this.path = el[0].path;
    });
  }
}
