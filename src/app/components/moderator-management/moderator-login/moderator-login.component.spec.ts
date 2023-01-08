import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SocialLoginModule } from 'angularx-social-login';
import { NgxIziToastModule } from 'ngx-izitoast';
import { HttpLoaderFactory } from 'src/app/app.module';
import { AdminFooterComponent } from '../../partial/admin-footer/admin-footer.component';
import { AdminHeaderComponent } from '../../partial/admin-header/admin-header.component';

import { ModeratorLoginComponent } from './moderator-login.component';

describe('ModeratorLoginComponent', () => {
  let component: ModeratorLoginComponent;
  let fixture: ComponentFixture<ModeratorLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModeratorLoginComponent,
        AdminHeaderComponent,
        AdminFooterComponent,
      ],
      imports: [
        NgxIziToastModule,
        HttpClientModule,
        RouterTestingModule,
        SocialLoginModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        FormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
