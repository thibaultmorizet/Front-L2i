import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxIzitoastService } from 'ngx-izitoast';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import StorageCrypter from 'storage-crypter';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: [
    './admin-login.component.css',
    './../../../css/header.css',
    './../../../css/main.css',
  ],
})
export class AdminLoginComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  errorConnexion: string | null = null;
  connectedUser: User | null = {};
  userLogin: User = {};
  errorPassword: string | null = null;
  errorEmail: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iziToast: NgxIzitoastService,
    private as: AuthService,
    private us: UserService
  ) {}

  ngOnInit(): void {
    this.clearStoragecrypter();
  }

  adminLogin() {
    this.as.login(this.userLogin).subscribe({
      next: (res) => {
        if (res.token != null) {
          this.storageCrypter.setItem('jeton', res.token, 'local');

          this.as.getTheUser(this.userLogin.email).subscribe((res) => {
            if (res[0].roles?.includes('ROLE_ADMIN')) {
              this.storageCrypter.setItem(
                'user',
                JSON.stringify(res[0]),
                'session'
              );

              this.connectedUser = JSON.parse(
                this.storageCrypter.getItem('user', 'session')
              );
              this.userLogin = {};
              this.iziToast.success({
                message: 'Connexion réussie',
                position: 'topRight',
              });
              this.router.navigateByUrl('/admin-home');
            } else {
              this.storageCrypter.removeItem('jeton', 'local');
              this.userLogin = {};
              this.iziToast.error({
                message:
                  'Vous devez être administrateur pour vous connecter ici',
                position: 'topRight',
              });
            }
          });
        }
      },
      error: (res) => {
        this.errorConnexion = res.message;
      },
    });
  }

  clearStoragecrypter() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('basket', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.connectedUser = null;
  }

}
