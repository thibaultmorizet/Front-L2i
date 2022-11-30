import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from '../interfaces/book';

import { Injectable } from '@angular/core';
import { Contact } from '../interfaces/contact';
import { NgxIzitoastService } from 'ngx-izitoast';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(
    private http: HttpClient,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {}

  sendMail(contactForm: Contact) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        'https://formspree.io/f/mkneqdqq',
        {
          name: contactForm.subject,
          replyto: contactForm.email,
          message: contactForm.message,
        },
        { headers: headers }
      )
      .subscribe((response) => {
        this.iziToast.success({
          message: this.translate.instant('izitoast.mail_sent'),
          position: 'topRight',
        });
      });
  }
}
