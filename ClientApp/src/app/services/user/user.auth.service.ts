import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserAuthConfiguration } from '../../configuration/user.auth.configuration';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject, timer, Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHeaderService } from '../shared/http.header.service';
import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';


//Ref:
//https://github.com/robisim74/AngularSPAWebAPI/issues/1

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {

  requireLoginSubject: Subject<boolean>;
  tokenIsBeingRefreshed: Subject<boolean>;
  lastUrl: string;
  jwtHelper: JwtHelperService = new JwtHelperService();
  public logout_event: EventEmitter<any> = new EventEmitter();
  sessionEndpoint: string;
  refreshTokenRequireRefreshTimerSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userAuthConfiguration: UserAuthConfiguration,
    private httpHeaderService: HttpHeaderService,
    private socialAuthService: SocialAuthService,
    private authService: SocialAuthService

  ) {
    this.requireLoginSubject = new Subject<boolean>();
    this.tokenIsBeingRefreshed = new Subject<boolean>();
    this.tokenIsBeingRefreshed.next(false);
    this.lastUrl = "/home";

  }

  isUserAuthenticated() {
    if (this.loggedIn()) {
      this.requireLoginSubject.next(false);
      return true;
    } else {
      return false;
    }
  }

  login(username: string, password: string, captchaResponse: string) {

    console.log("UserAuthService.constructor() ... site " + this.userAuthConfiguration.tokenEndpoint);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('client_id', this.userAuthConfiguration.clientId)
      .set('client_secret', this.userAuthConfiguration.clientSecret)
      .set('captcha_response', captchaResponse)
      .set('grant_type', 'password')

    return this.http.post(this.userAuthConfiguration.tokenEndpoint, params.toString(), { headers: headers })
      .pipe(
        map((token: any) => {
          this.addTokens(token.access_token, token.refresh_token);
          return token;
        }));

  }

  loggedIn(): boolean {
    if (localStorage.getItem("access_token"))
      return true;
    else
      return false;
  }

  addTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  refreshTokenSuccessHandler(data) {
    if (data.error) {
      console.log("Removing tokens.");
      this.logout();
      this.requireLoginSubject.next(true);
      this.tokenIsBeingRefreshed.next(false);
      this.returnNavigate();

      return false;
    } else {
      this.addTokens(data.access_token, data.refresh_token);
      this.requireLoginSubject.next(false);
      this.tokenIsBeingRefreshed.next(false);
      console.log("Refreshed user token");
    }
  }

  refreshTokenErrorHandler(error) {
    if (error.status == 440  //Session
      || error.status == 401 //Unauthorized
      || error.status == 400 //bad request when sibling is timeout
    ) {
      this.requireLoginSubject.next(true);
      this.logout();
      this.tokenIsBeingRefreshed.next(false);
    }
  }

  refreshToken() {
    const socialLoginId = localStorage.getItem("SocialLoginId");

    if (socialLoginId === "dmc") {

      console.log("UserAuthService.refreshToken()");

      const refToken = localStorage.getItem('refresh_token');
      //let refTokenId = this.jwtHelper.decodeToken(refToken).refreshTokenId;
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      //let options = new RequestOptions({ headers: headers });
      const body = new HttpParams()
        .set('client_id', this.userAuthConfiguration.clientId)
        .set('client_secret', this.userAuthConfiguration.clientSecret)
        .set('grant_type', 'refresh_token')
        .set('refresh_token', refToken);

      console.debug(`user.auth.service.refreshToken() tokenEndpoin = ${this.userAuthConfiguration.tokenEndpoint}`)
      return this.http.post(this.userAuthConfiguration.tokenEndpoint, body.toString(), { headers: headers });
    }
    else if (socialLoginId === "google")
    {
      this.socialAuthService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).catch(
        err => {
          this.logout();
        }
      );
    }
  }

  refreshTokenRequireRefreshTimer()
  {
    this.refreshTokenRequireRefreshTimerSubscription = timer(5000, 5000).subscribe(
      () => {

        const refreshToken = this.tokenRequiresRefresh();
        console.debug("refreshToken = " + refreshToken);

        if (refreshToken) {
          this.refreshToken()
            .subscribe((data) => {
              this.refreshTokenSuccessHandler(data);

              if (!this.loggedIn()) {
                this.logout();
              }
            }, (e) => {
              console.debug(`http.auth.service.get, error ${e.message}`);
              console.error(e);
              this.refreshTokenErrorHandler(e);
            });
        }
      });
  }

  tokenRequiresRefresh(): boolean {
    const isExpired = this.jwtHelper.isTokenExpired(localStorage.getItem("access_token"));
    if (isExpired) {
      console.debug("Token refresh is required");
    }
    return isExpired;
  }

  logout() {
    let headers = this.httpHeaderService.jsonContentType();
    headers = this.httpHeaderService.socialLoginId(headers);
    headers = this.httpHeaderService.token(headers);
    headers = this.httpHeaderService.tokenId(headers);
    this.subLogout();
    //return this.http.get("api/identity/user/logout", { headers: headers })
    //  .subscribe(
    //    () => this.subLogout(),
    //    (e) => {
    //      console.error(e);
    //      this.subLogout()
    //    });
  }

  subLogout() {
    console.debug("subLogout");

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userInfo');

    this.authService.signOut();

    this.returnNavigate();
    console.debug("subLogout after returnNavigate()");

    this.requireLoginSubject.next(true);
    this.logout_event.emit(null);
  }

  returnNavigate() {
    const isMobile = localStorage.getItem("isMobile");
    if (isMobile === "true") {
      this.router.navigate(['/home/login']);
    }
    else {
      this.router.navigate(['/home']);
    }
  }

  dispose() {
    this.refreshTokenRequireRefreshTimerSubscription.unsubscribe();
  }

}
