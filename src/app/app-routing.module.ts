import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/book/book.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { BasketDetailsComponent } from './components/basket-details/basket-details.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';

const routes: Routes = [
  { path: 'books', component: BookComponent },
  { path: 'basket', component: BasketDetailsComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: 'admin-register', component: AdminRegisterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
