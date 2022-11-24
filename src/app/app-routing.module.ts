import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/book/book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { NewBookComponent } from './components/new-book/new-book.component';
import { HomeComponent } from './components/home/home.component';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminBooksComponent } from './components/admin-books/admin-books.component';
import { AdminAccountComponent } from './components/admin-account/admin-account.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/admin-admins/admin-admins.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'books', component: BookComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'new-book', component: NewBookComponent },
  { path: 'home', component: HomeComponent },
  { path: 'legal-notices', component: LegalNoticesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'admin/home', component: AdminHomeComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/books', component: AdminBooksComponent },
  { path: 'admin/account', component: AdminAccountComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/admins', component: AdminAdminsComponent },

  { path: '**', pathMatch: 'full', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
