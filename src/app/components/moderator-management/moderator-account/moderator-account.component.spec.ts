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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpLoaderFactory } from 'src/app/app.module';
import { ModeratorFooterComponent } from '../../partial/moderator-footer/moderator-footer.component';
import { ModeratorHeaderComponent } from '../../partial/moderator-header/moderator-header.component';
import { ModeratorAccountComponent } from './moderator-account.component';

describe('ModeratorAccountComponent', () => {
  let component: ModeratorAccountComponent;
  let fixture: ComponentFixture<ModeratorAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModeratorAccountComponent,
        ModeratorHeaderComponent,
        ModeratorFooterComponent,
      ],
      imports: [
        ConfirmDialogModule,
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

    fixture = TestBed.createComponent(ModeratorAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
