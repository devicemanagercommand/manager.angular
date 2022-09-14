import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserAuthService } from '../../services/user/user.auth.service'
import { UserService } from '../../services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RedirectToLoginGuard implements CanActivate {

  constructor(private router: Router
    , private userAuthService: UserAuthService
    , private userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("RedirectToLoginGuard.canActivate()");

    const userInfo = this.userService.getSavedInfo();

    if ((this.userAuthService.isUserAuthenticated() && !route.data.roles)
      || (route.data.roles && userInfo && userInfo.roles.filter(x => route.data.roles.filter(r => r === x).length > 0))) {
      return true;//logged in so return true
    }

    //not logged in so redirect to home page with the return url
    const isMobile = localStorage.getItem("isMobile");
    const url = isMobile === "true" ? "/home/login" : "/home";

    this.router.navigate([url], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
