import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from '../interfaces/book';

import { Injectable } from '@angular/core';
import { Contact } from '../interfaces/contact';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: HttpClient) {}

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
        });
    
  }
}
