import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/book/book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { BasketDetailsComponent } from './components/basket-details/basket-details.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { NewBookComponent } from './components/new-book/new-book.component';
import { HomeComponent } from './components/home/home.component';
import { LegalNoticesComponent } from './components/legal-notices/legal-notices.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'books', component: BookComponent },
  { path: 'basket', component: BasketDetailsComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: 'admin-register', component: AdminRegisterComponent },
  { path: 'new-book', component: NewBookComponent },
  { path: 'home', component: HomeComponent },
  { path: 'legal-notices', component: LegalNoticesComponent },
  { path: 'contact', component: ContactComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
