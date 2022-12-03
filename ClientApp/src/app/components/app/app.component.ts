import { Component, OnInit } from '@angular/core';
import { LangService } from '../../services/shared/lang.service';
import { UserAuthService } from "../../services/user/user.auth.service";
import { ConfigurationService } from '../../services/shared/configuration.service';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SnackbarService } from '../../services/shared/snackbar.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { finalize, Subscription } from 'rxjs';
import { GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { HttpHeaderService } from '../../services/shared/http.header.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  socialAthServiceSubscription: Subscription;

  constructor(
    public rs: LangService,
    private configurationService: ConfigurationService,
    private router: Router,
    private snackService: SnackbarService,
    private socialAuthService: SocialAuthService,
    private userAuthService: UserAuthService,
    private httpHeaderService: HttpHeaderService,
    private http: HttpClient,
    private userService: UserService
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
    try {

      //on success
      this.socialAthServiceSubscription = this.socialAuthService.authState.subscribe((userData: SocialUser) => {

        this.userAuthService.addTokens(userData.idToken, "");

        const jsonContentTypeHeader = this.httpHeaderService.jsonContentType();

        //this will return user data from google. What you need is a user token which you will send it to the server
        this.http.post("/api/identity/auth/google", JSON.stringify(userData), { headers: jsonContentTypeHeader })
          .pipe(finalize(() => {/* this.isLoading = false; */}))
          .subscribe((result: any) => {

            console.debug("google login");

            localStorage.setItem("SocialLoginId", "google");
            localStorage.setItem("token", result.token);
            localStorage.setItem("tokenId", result.tokenId);

            this.userService.getInfo()
              .pipe(finalize(() => { }/*this.isLoading = false*/ ))
              .subscribe(r => {

                //this.close();
                this.router.navigate(['/devices'])

              }, (error) => {
                this.snackService.Error(error);
              })
          });
      });

    } catch (error) {
      //this.isLoading = false;
      if (error.error !== "popup_closed_by_user") {
        this.snackService.Error(error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.socialAthServiceSubscription) {
      this.socialAthServiceSubscription.unsubscribe();
    }
  }

  logout() {
    console.log("DeviceNavRightMenuComponent.logout() ...");

    this.userAuthService.logout();
  }
}


