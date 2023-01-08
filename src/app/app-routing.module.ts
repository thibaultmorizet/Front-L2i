import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './components/shop/shop.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-management/admin-home/admin-home.component';
import { ModeratorHomeComponent } from './components/moderator-management/moderator-home/moderator-home.component';
import { HomeComponent } from './components/home/home.component';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { AdminLoginComponent } from './components/admin-management/admin-login/admin-login.component';
import { ModeratorLoginComponent } from './components/moderator-management/moderator-login/moderator-login.component';
import { AdminBooksComponent } from './components/admin-management/books-management/admin-books/admin-books.component';
import { AdminVideosComponent } from './components/admin-management/videos-management/admin-videos/admin-videos.component';
import { AdminAccountComponent } from './components/admin-management/admin-account/admin-account.component';
import { ModeratorAccountComponent } from './components/moderator-management/moderator-account/moderator-account.component';
import { AdminUsersComponent } from './components/admin-management/users-management/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/admin-management/users-management/admin-admins/admin-admins.component';
import { LoginComponent } from './components/login/login.component';
import { AdminFormatsComponent } from './components/admin-management/books-management/admin-formats/admin-formats.component';
import { AdminEditorsComponent } from './components/admin-management/books-management/admin-editors/admin-editors.component';
import { AdminAuhtorsComponent } from './components/admin-management/books-management/admin-auhtors/admin-auhtors.component';
import { AdminCategoriesComponent } from './components/admin-management/books-management/admin-categories/admin-categories.component';
import { ForgottenPasswordComponent } from './components/forgotten-password/forgotten-password.component';
import { AdminBrandsComponent } from './components/admin-management/videos-management/admin-brands/admin-brands.component';
import { AdminModeratorsComponent } from './components/admin-management/users-management/admin-moderators/admin-moderators.component';
import { ModeratorCommentsComponent } from './components/moderator-management/moderator-comments/moderator-comments.component';
import { AdminCommentsComponent } from './components/admin-management/admin-comments/admin-comments.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'shop', component: ShopComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'legal-notices', component: LegalNoticesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'forgotten-password', component: ForgottenPasswordComponent },
  { path: 'admin/home', component: AdminHomeComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/account', component: AdminAccountComponent },
  { path: 'admin/books', component: AdminBooksComponent },
  { path: 'admin/videos', component: AdminVideosComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/admins', component: AdminAdminsComponent },
  { path: 'admin/moderators', component: AdminModeratorsComponent },
  { path: 'admin/formats', component: AdminFormatsComponent },
  { path: 'admin/editors', component: AdminEditorsComponent },
  { path: 'admin/authors', component: AdminAuhtorsComponent },
  { path: 'admin/brands', component: AdminBrandsComponent },
  { path: 'admin/categories', component: AdminCategoriesComponent },
  { path: 'moderator/home', component: ModeratorHomeComponent },
  { path: 'moderator/login', component: ModeratorLoginComponent },
  { path: 'moderator/account', component: ModeratorAccountComponent },
  { path: 'moderator/comments/1', component: ModeratorCommentsComponent },
  { path: 'moderator/comments/2', component: ModeratorCommentsComponent },
  { path: 'moderator/comments/3', component: ModeratorCommentsComponent },
  { path: 'admin/comments/1', component: AdminCommentsComponent },
  { path: 'admin/comments/2', component: AdminCommentsComponent },
  { path: 'admin/comments/3', component: AdminCommentsComponent },

  { path: '**', pathMatch: 'full', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
