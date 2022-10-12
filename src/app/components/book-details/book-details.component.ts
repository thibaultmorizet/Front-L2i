import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import { BookService } from 'src/app/services/book.service';
import { FormatService } from 'src/app/services/format.service';
import StorageCrypter from 'storage-crypter';
import {
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';
@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css','./../../../css/header.css','./../../../css/main.css'],
})
export class BookDetailsComponent implements OnInit {
  book: Book = {};
  idBook: number = 0;
  basket: Array<Book> = [];
  storageCrypter = new StorageCrypter('Secret');
  bookExistinBasket: Boolean = false;
  numberToOrder: string = '1';
  userInscription: User = {};
  userLogin: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;
  errorConnexion: string | null = null;
  connectedUser: User | null = {};

  socialUser!: SocialUser;
  isLoggedin?: boolean;

  constructor(
    private bs: BookService,
    private fs: FormatService,
    private us: UserService,
    private as: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private modalService: NgbModal,
    private authService: SocialAuthService
    ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((res) => {
      this.idBook = +(res.get('id') ?? '0');
      this.bs.getOneBook(this.idBook).subscribe((b) => {
        this.book = b;
      });
      try {
        this.getUserByEmail(JSON.parse(
          this.storageCrypter.getItem('user', 'session')
        ).email)
      } catch (error) {
        this.connectedUser = null;
      }
      if (this.storageCrypter.getItem('basket', 'local') != '') {
        this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));        
      }
      this.authService.authState.subscribe((user) => {      
        this.socialUser = user;
        this.isLoggedin = user != null;
      });  
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.logout();
      } 
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  getUserByEmail(email: string) {
    this.us.getTheUser(email).subscribe((res) => {
      this.connectedUser = res[0];
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  addBookToBasket(event: any, bookId: number | undefined) {
    this.numberToOrder = event.target.querySelector('select').value;

    this.bookExistinBasket = false;
    if (bookId != undefined) {
      this.bs.getOneBook(bookId).subscribe((res) => {
        this.basket.forEach((el) => {
          if (res.id == el.id) {
            this.bookExistinBasket = true;

            if (
              el.book_stock &&
              el.book_number_ordered &&
              el.book_number_ordered + parseInt(this.numberToOrder) >
                el.book_stock
            ) {
              this.iziToast.error({
                title: 'Manque de stock',
                message:
                  'Il reste ' +
                  res.book_stock +
                  ' exemplaires de ce livre et vous en demandez ' +
                  (el.book_number_ordered + parseInt(this.numberToOrder)),
                position: 'topRight',
              });
            } else {
              if (el.book_number_ordered != undefined) {
                el.book_number_ordered =
                  el.book_number_ordered + parseInt(this.numberToOrder);
                if (el.book_unit_price) {
                  el.book_total_price = parseFloat(
                    (el.book_number_ordered * el.book_unit_price).toFixed(2)
                  );
                }
                this.iziToast.success({
                  message: 'Article ajouté au panier',
                  position: 'topRight',
                });
                this.storageCrypter.setItem(
                  'basket',
                  JSON.stringify(this.basket),
                  'local'
                );
              }
            }
          }
        });

        if (!this.bookExistinBasket) {
          if (res.book_stock && parseInt(this.numberToOrder) > res.book_stock) {
            this.iziToast.error({
              title: 'Manque de stock',
              message:
                'Il reste ' +
                res.book_stock +
                ' exemplaires de ce livre et vous en demandez ' +
                parseInt(this.numberToOrder),
              position: 'topRight',
            });
          } else {
            res.book_number_ordered = parseInt(this.numberToOrder);
            if (res.book_unit_price) {
              res.book_total_price = parseFloat(
                (res.book_number_ordered * res.book_unit_price).toFixed(2)
              );
            }

            this.basket.push(res);
            this.iziToast.success({
              message: 'Article ajouté au panier',
              position: 'topRight',
            });
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        }
      });
    }
  }
  registerModal(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          if (reason == 0 || reason == 'Cross click') {
            this.userInscription = {};
          }
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  loginModal(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          if (reason == 0 || reason == 'Cross click') {
            this.userLogin = {};
          }
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  register() {
    if (this.userInscription.password == this.userInscription.passwordConfirm) {
      this.errorPassword = '';

      //delete this.userInscription.passwordConfirm;
      this.us.getTheUser(this.userInscription.email).subscribe((res) => {
        if (res[0] == undefined) {
          this.errorEmail = '';

          this.us.register(this.userInscription).subscribe((resRegister) => {
            this.modalService.dismissAll();
            this.userInscription = {};
            this.iziToast.success({
              message: 'Inscription réussie',
              position: 'topRight',
            });
          });
        } else {
          this.errorEmail = 'Cet email est déjà utilisé';
        }
      });
    } else {
      this.errorPassword = 'Les mots de passes ne sont pas identiques';
    }
  }
  login() {
    this.as.login(this.userLogin).subscribe({
      next: (res) => {
        if (res.token != null) {
          this.storageCrypter.setItem('jeton', res.token, 'local');

          this.as.getTheUser(this.userLogin.email).subscribe((res) => {
            this.storageCrypter.setItem(
              'user',
              JSON.stringify(res[0]),
              'session'
            );

            this.connectedUser = JSON.parse(
              this.storageCrypter.getItem('user', 'session')
            );
            this.modalService.dismissAll();
            this.userLogin = {};
            this.iziToast.success({
              message: 'Connexion réussie',
              position: 'topRight',
            });
          });
        }
      },
      error: (res) => {
        this.errorConnexion = res.message;
      },
    });
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.authService.signOut();
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

}
