import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './components/shop/shop.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { HomeComponent } from './components/home/home.component';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminBooksComponent } from './components/admin-books/admin-books.component';
import { AdminVideosComponent } from './components/admin-videos/admin-videos.component';
import { AdminAccountComponent } from './components/admin-account/admin-account.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/admin-admins/admin-admins.component';
import { LoginComponent } from './components/login/login.component';
import { AdminFormatsComponent } from './components/admin-formats/admin-formats.component';
import { AdminEditorsComponent } from './components/admin-editors/admin-editors.component';
import { AdminAuhtorsComponent } from './components/admin-auhtors/admin-auhtors.component';
import { AdminCategoriesComponent } from './components/admin-categories/admin-categories.component';
import { ForgottenPasswordComponent } from './components/forgotten-password/forgotten-password.component';
import { AdminBrandsComponent } from './components/admin-brands/admin-brands.component';
import { AdminModeratorsComponent } from './components/admin-moderators/admin-moderators.component';

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
  { path: 'admin/books', component: AdminBooksComponent },
  { path: 'admin/videos', component: AdminVideosComponent },
  { path: 'admin/account', component: AdminAccountComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/admins', component: AdminAdminsComponent },
  { path: 'admin/moderators', component: AdminModeratorsComponent },
  { path: 'admin/formats', component: AdminFormatsComponent },
  { path: 'admin/editors', component: AdminEditorsComponent },
  { path: 'admin/authors', component: AdminAuhtorsComponent },
  { path: 'admin/brands', component: AdminBrandsComponent },
  { path: 'admin/categories', component: AdminCategoriesComponent },

  { path: '**', pathMatch: 'full', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
