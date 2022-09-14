import { Injectable, isDevMode } from '@angular/core';
import { ConfigurationService } from '../services/shared/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UserAuthConfiguration {

  constructor(public configurationService: ConfigurationService) {
  }

  public _tokenEndpoint: string
  public get tokenEndpoint(): string {
    return this.configurationService.model.oAuthUrl + "/connect/token";
  }

  public _sessionEndpoint: string
  public get sessionEndpoint(): string {
    return this.configurationService.model.oAuthUrl + "/connect/endsession";
  }


  public clientId = "angular-client";
  public clientSecret = "angular-secret";
  public logoutUrl = "/home";
  public unauthorizedUrl = "/home/unauthorized";
}

interface ResourceValue {
  name: string;
  value: string;
}
