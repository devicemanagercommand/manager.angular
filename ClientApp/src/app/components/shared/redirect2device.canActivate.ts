import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserAuthService } from '../../services/user/user.auth.service'

@Injectable({
  providedIn: 'root',
})
export class Redirect2DeviceGuard implements CanActivate {

  constructor(private router: Router
    , private userAuthService: UserAuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("Redirect2DeviceGuard.canActivate()");
    if (!this.userAuthService.isUserAuthenticated()) {
      return true;//logged in so return true to continue route
    }
    else {

      console.log("Redirect2DeviceGuard.canActivate() ... redirect to device ...");

      //logged in so redirect to devices page
      this.router.navigate(['/devices']);
      return false;//Cancel route 
    }
  }
}
