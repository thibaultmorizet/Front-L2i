import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import StorageCrypter from 'storage-crypter';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  storageCrypter = new StorageCrypter('Secret');

  constructor(private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const jeton = this.storageCrypter.getItem('jeton', 'local');
    if (jeton) {
      return true;
    } else {
      this.router.navigateByUrl('/products');
      return false;
    }


  }

}
