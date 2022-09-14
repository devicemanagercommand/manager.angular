import { Component, OnInit } from '@angular/core';
import { LangService } from '../../services/shared/lang.service';
import { UserAuthService } from "../../services/user/user.auth.service";
import { ConfigurationService } from '../../services/shared/configuration.service';
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app',
  templateUrl: './app.home.component.html',
  styleUrls: ['./app.home.component.scss']
})
export class AppHomeComponent implements OnInit {

  constructor(
    public rs: LangService,
    public userAuthService: UserAuthService,
    private configurationService: ConfigurationService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private router: Router
  ) {
    console.log("App.constructor");
  }

  ngOnInit(): void {
    this.configurationService.init().subscribe();
    this.printpath('', this.router.config);
  }

  printpath(parent: string, config: Route[]) {
    for (let i = 0; i < config.length; i++) {
      const route = config[i];
      console.log(parent + '/' + route.path);
      if (route.children) {
        const currentPath = route.path ? parent + '/' + route.path : parent;
        this.printpath(currentPath, route.children);
      }
    }
  }

  logout() {
    console.log("DeviceNavRightMenuComponent.logout() ...");

    this.userAuthService.logout();
  }
}


