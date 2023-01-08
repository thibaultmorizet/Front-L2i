import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SocialLoginModule } from 'angularx-social-login';
import { NgxIziToastModule } from 'ngx-izitoast';
import { HttpLoaderFactory } from 'src/app/app.module';

import { ModeratorFooterComponent } from './moderator-footer.component';

describe('ModeratorFooterComponent', () => {
  let component: ModeratorFooterComponent;
  let fixture: ComponentFixture<ModeratorFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModeratorFooterComponent],
      imports: [
        NgxIziToastModule,
        HttpClientModule,
        SocialLoginModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        FormsModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
