import { Component, OnInit } from '@angular/core';
import { LangService } from '../../services/shared/lang.service';
import { UserAuthService } from "../../services/user/user.auth.service";
import { ConfigurationService } from '../../services/shared/configuration.service';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SnackbarService } from '../../services/shared/snackbar.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    public rs: LangService,
    public userAuthService: UserAuthService,
    private configurationService: ConfigurationService,
    private router: Router,
    private snackService: SnackbarService,
    private authService: SocialAuthService
  ) {
    console.log("App.constructor");

    //Router subscriber
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.snackService.Close();
      }

      if (event instanceof NavigationError) {
      }

      if (event instanceof NavigationEnd) {
        //do something on end activity
      }
    });
  }



  ngOnInit(): void {
      }

  logout() {
    console.log("DeviceNavRightMenuComponent.logout() ...");

    this.userAuthService.logout();
  }
}


