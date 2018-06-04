import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let userBridge = localStorage.getItem('user_bridge') 
      let isLoggedIn = userBridge !== null
      if(isLoggedIn) {
        this.router.navigate(['overview'])
      }
      return !isLoggedIn
  }
}
