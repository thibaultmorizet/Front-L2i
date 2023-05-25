import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  FacebookLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from 'angularx-social-login';
import { NgxIziToastModule } from 'ngx-izitoast';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { HttpLoaderFactory } from 'src/app/app.module';
import { ModeratorFooterComponent } from '../../partial/moderator-footer/moderator-footer.component';
import { ModeratorHeaderComponent } from '../../partial/moderator-header/moderator-header.component';

import { ModeratorHomeComponent } from './moderator-home.component';

describe('ModeratorHomeComponent', () => {
  let component: ModeratorHomeComponent;
  let fixture: ComponentFixture<ModeratorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModeratorHomeComponent,
        ModeratorHeaderComponent,
        ModeratorFooterComponent,
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
        TableModule,
        DialogModule,
      ],
      providers: [
        {
          provide: 'SocialAuthServiceConfig',
          useValue: {
            autoLogin: false,
            providers: [
              {
                id: FacebookLoginProvider.PROVIDER_ID,
                provider: new FacebookLoginProvider('496421065692400'),
              },
            ],
            onError: (err) => {
              console.error(err);
            },
          } as SocialAuthServiceConfig,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
