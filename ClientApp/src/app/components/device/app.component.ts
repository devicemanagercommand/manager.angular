import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangService } from '../../services/shared/lang.service';
import { UserAuthService } from "../../services/user/user.auth.service";
import { ConfigurationService } from '../../services/shared/configuration.service';
import { ReCaptchaV3Service } from 'ng-recaptcha'

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppDeviceComponent implements OnInit, OnDestroy {


  constructor(
    public rs: LangService,
    public userAuthService: UserAuthService,
    private configurationService: ConfigurationService,
    private reCaptchaV3Service: ReCaptchaV3Service
  ) {
    console.log("App.constructor");
  }

  ngOnDestroy(): void {
    this.userAuthService.dispose();
  }

  ngOnInit(): void {
    this.configurationService.init().subscribe();

    this.userAuthService.refreshTokenRequireRefreshTimer();
  }

  logout() {
    console.log("DeviceNavRightMenuComponent.logout() ...");

    this.userAuthService.logout();
  }
}


