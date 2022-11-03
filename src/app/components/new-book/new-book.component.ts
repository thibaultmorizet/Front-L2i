import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Author } from 'src/app/interfaces/author';
import { Book } from 'src/app/interfaces/book';
import { Editor } from 'src/app/interfaces/editor';
import { Format } from 'src/app/interfaces/format';
import { Type } from 'src/app/interfaces/type';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { EditorService } from 'src/app/services/editor.service';
import { FormatService } from 'src/app/services/format.service';
import { TypeService } from 'src/app/services/type.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-new-book',
  templateUrl: './new-book.component.html',
  styleUrls: ['./new-book.component.css', './../../../css/main.css'],
})
export class NewBookComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  cart: Array<Book> = [];
  newBook: Book = {};
  fileToUpload: any = {};
  formats: Array<Format> = [];
  editors: Array<Editor> = [];
  authors: Array<Author> = [];
  types: Array<Type> = [];

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private authService: SocialAuthService,
    private fs: FormatService,
    private es: EditorService,
    private authorService: AuthorService,
    private ts: TypeService,
    private bs: BookService,
  ) {}

  ngOnInit(): void {
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
      this.iziToast.warning({
        message: 'Accès impossible si vous nêtes pas connecté',
        position: 'topRight',
      });
      this.router.navigateByUrl('/books');
    }
    if (this.storageCrypter.getItem('cart', 'local') != '') {
      this.cart = JSON.parse(this.storageCrypter.getItem('cart', 'local'));
    }
    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      }
    }
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
    this.getAllFormatsfunc();
    this.getAllEditorsfunc();
    this.getAllAuthorsfunc();
    this.getAllTypesfunc();
  }

  getAllFormatsfunc() {
    this.fs.getAllFormats().subscribe((res) => {
      res.forEach((el) => {
        el.filter_is_selected = false;
        if (el.books != undefined) {
          el.books.forEach((aBook) => {
            if (el.count_books != undefined) {
              el.count_books++;
            } else {
              el.count_books = 1;
            }
          });
        }
      });
      this.formats = res;
    });
  }

  getAllEditorsfunc() {
    this.es.getAllEditors().subscribe((res) => {
      this.editors = res;
    });
  }
  getAllAuthorsfunc() {
    this.authorService.getAllAuthors().subscribe((res) => {
      this.authors = res;
    });
  }
  getAllTypesfunc() {
    this.ts.getAllTypes().subscribe((res) => {
      res.forEach((el) => {
        el.filter_is_selected = false;
        if (el.books != undefined) {
          el.books.forEach((aBook) => {
            if (el.count_books != undefined) {
              el.count_books++;
            } else {
              el.count_books = 1;
            }
          });
        }
      });

      this.types = res;
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.connectedUser = null;
    this.router.navigateByUrl('/home');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  refreshToken() {
    if (!this.storageCrypter.getItem('user', 'session')) {
      this.storageCrypter.removeItem('jeton', 'local');
    }

    this.as
      .login(JSON.parse(this.storageCrypter.getItem('user', 'session')))
      .subscribe({
        next: (res) => {
          if (res.token != null) {
            this.storageCrypter.setItem('jeton', res.token, 'local');
          }
        },
        error: (res) => {
          this.logout();
        },
      });
  }
  setBook() {
    if (this.connectedUser?.roles?.includes('ROLE_ADMIN')) {
      this.newBook.type = [];
      this.types.forEach((aType) => {
        if (aType.isChecked) {
          this.newBook.type?.push(aType);
        }
      });
      this.newBook.author = [];
      this.authors.forEach((anAuthor) => {
        if (anAuthor.isChecked) {
          this.newBook.author?.push(anAuthor);
        }
      });

      this.bs.createBook(this.newBook).subscribe((res) => {
        this.newBook.image =
          'https://www.thibaultmorizet.fr/assets/' + res.id + '.jpeg';
        this.bs.updateBook(res.id, this.newBook).subscribe((result) => {
          this.newBook = {};
          this.ngOnInit();
          this.iziToast.success({
            message: 'Modification réussie',
            position: 'topRight',
          });
        });
      });
    } else {
      this.iziToast.error({
        message: "Impossible de créer un livre si vous n'êtes pas admin",
        position: 'topRight',
      });
    }
  }
  uploadFile(file: any) {
    this.fileToUpload = file.files[0];
    /*  if (this.fileToUpload) {
      this.bs.uploadCoverImage(this.fileToUpload).subscribe(resp => {
        alert("Uploaded")
      })
    } else {
      alert("Please select a file first")
    } */
  }
}
