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
import { ShopComponent } from './components/shop/shop.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { NgxIziToastModule } from 'ngx-izitoast';
import { AuthInterceptor } from './services/auth.interceptor';

import { CartDetailsComponent } from './components/cart-details/cart-details.component';

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  FacebookLoginProvider,
} from 'angularx-social-login';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-management/admin-home/admin-home.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';

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
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

import {
  TranslateLoader,
  TranslateCompiler,
  TranslateModule,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdminLoginComponent } from './components/admin-management/admin-login/admin-login.component';
import { AdminHeaderComponent } from './components/partial/admin-header/admin-header.component';
import { ModeratorHeaderComponent } from './components/partial/moderator-header/moderator-header.component';
import { AdminFooterComponent } from './components/partial/admin-footer/admin-footer.component';
import { ModeratorFooterComponent } from './components/partial/moderator-footer/moderator-footer.component';
import { AdminBooksComponent } from './components/admin-management/books-management/admin-books/admin-books.component';
import { AdminAccountComponent } from './components/admin-management/admin-account/admin-account.component';
import { AdminUsersComponent } from './components/admin-management/users-management/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/admin-management/users-management/admin-admins/admin-admins.component';
import { LoginComponent } from './components/login/login.component';
import { AdminFormatsComponent } from './components/admin-management/books-management/admin-formats/admin-formats.component';
import { AdminEditorsComponent } from './components/admin-management/books-management/admin-editors/admin-editors.component';
import { AdminAuthorsComponent } from './components/admin-management/admin-authors/admin-authors.component';
import { AdminCategoriesComponent } from './components/admin-management/books-management/admin-categories/admin-categories.component';
import { ForgottenPasswordComponent } from './components/forgotten-password/forgotten-password.component';
import { AdminVideosComponent } from './components/admin-management/videos-management/admin-videos/admin-videos.component';
import { AdminBrandsComponent } from './components/admin-management/videos-management/admin-brands/admin-brands.component';
import { AdminModeratorsComponent } from './components/admin-management/users-management/admin-moderators/admin-moderators.component';
import { ModeratorAccountComponent } from './components/moderator-management/moderator-account/moderator-account.component';
import { ModeratorHomeComponent } from './components/moderator-management/moderator-home/moderator-home.component';
import { ModeratorLoginComponent } from './components/moderator-management/moderator-login/moderator-login.component';
import { ModeratorCommentsComponent } from './components/moderator-management/moderator-comments/moderator-comments.component';
import { AdminCommentsComponent } from './components/admin-management/admin-comments/admin-comments.component';

@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    ProductDetailsComponent,
    CartDetailsComponent,
    MyAccountComponent,
    AdminHomeComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    LegalNoticesComponent,
    ContactComponent,
    PagenotfoundComponent,
    AdminLoginComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
    AdminBooksComponent,
    AdminAccountComponent,
    AdminUsersComponent,
    AdminAdminsComponent,
    LoginComponent,
    AdminFormatsComponent,
    AdminEditorsComponent,
    AdminAuthorsComponent,
    AdminCategoriesComponent,
    ForgottenPasswordComponent,
    AdminVideosComponent,
    AdminBrandsComponent,
    AdminModeratorsComponent,
    ModeratorAccountComponent,
    ModeratorHomeComponent,
    ModeratorLoginComponent,
    ModeratorHeaderComponent,
    ModeratorFooterComponent,
    ModeratorCommentsComponent,
    AdminCommentsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxIziToastModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
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
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler,
      },
    }),
    ToastModule,
    ToolbarModule,
    TableModule,
    InputMaskModule,
    InputSwitchModule,
    CheckboxModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
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
  bootstrap: [AppComponent],
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
