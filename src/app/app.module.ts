import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookComponent } from './components/book/book.component';
import { UserComponent } from './components/user/user.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { NgxIziToastModule } from 'ngx-izitoast';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BasketDetailsComponent } from './components/basket-details/basket-details.component';

@NgModule({
  declarations: [
    AppComponent,
    BookComponent,
    UserComponent,
    BookDetailsComponent,
    BasketDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    NgxIziToastModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
