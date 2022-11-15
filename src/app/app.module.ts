import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookComponent } from './components/book/book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { NgxIziToastModule } from 'ngx-izitoast';
import { AuthInterceptor } from './services/auth.interceptor';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'angularx-social-login';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { NewBookComponent } from './components/new-book/new-book.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { HeaderComponent } from './components/partial/header/header.component';
import { FooterComponent } from './components/partial/footer/footer.component';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent,
    BookComponent,
    BookDetailsComponent,
    CartDetailsComponent,
    MyAccountComponent,
    AdminHomeComponent,
    AdminRegisterComponent,
    NewBookComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    LegalNoticesComponent,
    ContactComponent,
    PagenotfoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    NgxIziToastModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgbCarouselModule,
    CarouselModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DividerModule,
    PasswordModule,
    AccordionModule,
    ConfirmDialogModule,
    InputNumberModule,
    TabViewModule,
    InputTextareaModule,
    DropdownModule,
    SkeletonModule,
    TooltipModule,
    DialogModule,
    MultiSelectModule,
    SliderModule,
    AutoCompleteModule,
    PaginatorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          /* {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '191085854417-q1nheuh4v1hgspdo64vs87hn3ovajlh3.apps.googleusercontent.com'
            ),
          }, */
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
  bootstrap: [AppComponent],
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
