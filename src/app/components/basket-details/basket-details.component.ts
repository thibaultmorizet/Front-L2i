import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { Book } from 'src/app/interfaces/book';
import StorageCrypter from 'storage-crypter';
import { BasketService } from 'src/app/services/basket.service';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import {
  NgbActiveModal,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-basket-details',
  templateUrl: './basket-details.component.html',
  styleUrls: ['./basket-details.component.css'],
})
export class BasketDetailsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  basket: Array<Book> = [];
  errorConnexion: string | null = null;
  connectedUser: User | null = {};
  userInscription: User = {};
  userLogin: User = {};
  closeResult = '';
  errorPassword: string | null = null;
  errorEmail: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private us: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }

    if (this.storageCrypter.getItem('basket', 'local') != '') {
      this.basket = JSON.parse(this.storageCrypter.getItem('basket', 'local'));
    }
  }

  decreaseBookQuantity(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (
          el.book_number_ordered != undefined &&
          el.book_number_ordered == 1
        ) {
          this.deleteBookOfBasket(el.id);
        }
        if (el.book_number_ordered != undefined && el.book_number_ordered > 0) {
          if (el.book_total_price != undefined && el.book_unit_price) {
            el.book_number_ordered--;
            el.book_total_price -= el.book_unit_price;
            el.book_total_price = parseFloat(el.book_total_price.toFixed(2));
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        } else {
          this.iziToast.error({
            message: 'Vous ne pouvez pas demander une quantité négative',
            position: 'topRight',
          });
        }
      }
    });
  }

  increaseBookQuantity(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        if (
          el.book_number_ordered != undefined &&
          el.book_stock != undefined &&
          el.book_number_ordered < el.book_stock
        ) {
          if (el.book_total_price != undefined && el.book_unit_price) {
            el.book_number_ordered++;
            el.book_total_price += el.book_unit_price;
            el.book_total_price = parseFloat(el.book_total_price.toFixed(2));
            this.storageCrypter.setItem(
              'basket',
              JSON.stringify(this.basket),
              'local'
            );
          }
        } else {
          this.iziToast.error({
            message:
              'Cet article est disponible en ' +
              el.book_stock +
              ' exemplaire(s)',
            position: 'topRight',
          });
        }
      }
    });
  }

  deleteBookOfBasket(bookId: number | undefined) {
    this.basket.forEach((el) => {
      if (el.id == bookId) {
        const index = this.basket.indexOf(el, 0);
        if (index > -1) {
          this.basket.splice(index, 1);
        }
        this.storageCrypter.setItem(
          'basket',
          JSON.stringify(this.basket),
          'local'
        );
      }
    });
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
  logout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.connectedUser = null;
    this.router.navigateByUrl('/books');
    this.iziToast.success({
      message: 'Vous êtes déconnecté',
      position: 'topRight',
    });
  }

}
