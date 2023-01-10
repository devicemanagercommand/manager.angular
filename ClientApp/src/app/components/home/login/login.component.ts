import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangService } from '../../../services/shared/lang.service'
import { HttpAuthService } from '../../../services/user/http.auth.service'
import { UserAuthService } from '../../../services/user/user.auth.service'
import { HttpClient } from '@angular/common/http';
import { ComponentPipeService } from '../../../services/shared/component.pipe.service'
import { RecaptchaComponent } from 'ng-recaptcha'
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { finalize, timeout } from 'rxjs/operators'
import { UserService } from '../../../services/user/user.service';
import { TriggerHelper } from '../../../services/shared/helper.service';
import { MessageService } from '../../../services/shared/message.service';
import { HttpHeaderService } from '../../../services/shared/http.header.service';
import { ConfigurationService } from '../../../services/shared/configuration.service';
import { SnackbarService } from '../../../services/shared/snackbar.service';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [TriggerHelper.opacityPageWithNav("routeAnimation")]
})

export class LoginComponent implements AfterViewInit {
  requireCaptcha: boolean;
  public model: Login;
  isLoading: boolean;
  @ViewChild('user') private user: ElementRef;
  @ViewChild('captcha') captcha: RecaptchaComponent;
  @ViewChild('loginModal') loginModal: ModalDirective;

  captchaResponse: string;

  @HostBinding('@.disabled')
  public animationsDisabled = true;
  urlParamSubscription: any;
  isMobile: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public rs: LangService,
    private http: HttpClient,
    private httpAuth: HttpAuthService,
    private userAuthSerivce: UserAuthService,
    private renderer: Renderer2,
    public componentPipeService: ComponentPipeService,
    public modalService: BsModalService,
    private userService: UserService,
    public serviceMessage: MessageService,
    public httpHeaderService: HttpHeaderService,
    public configurationService: ConfigurationService,
    public snackService: SnackbarService
  ) {

    console.log("LoginCompoenent.constructor()")

    this.animationsDisabled = false;

    if (this.router.url.includes('/login/main')) {
      localStorage.setItem("isMobile", 'false');
      this.isMobile = false;
    }
    else {
      localStorage.setItem("isMobile", 'true');
      this.isMobile = true;
    }

    this.model = new Login();
  }



  //DMC Login
  login() {
    console.log("login");

    this.isLoading = true;

    this.userAuthSerivce.login(this.model.user, this.model.password, this.captchaResponse)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((token: any) => {
        console.log("login success");

        this.isLoading = true;
        localStorage.setItem("SocialLoginId", "dmc");
        localStorage.setItem("token", token.token);
        localStorage.setItem("tokenId", token.tokenId);

        this.userService.getInfo()
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(r => {
            this.close();
            console.log("redirecting to devices")
            this.router.navigate(['/devices'])


          }, (error) => {
            this.snackService.Error(error);
          })
      },
        (error) => {
          console.debug("login error.")
          console.error(error);
          if (error && error.error == "invalid_grant" && error.bf == 0) {
            this.snackService.Error(error);
          }
          else if (error.bf == 1) {
            this.requireCaptcha = true;
            this.snackService.Error(error);
          }
          else {
            this.snackService.Error(error);
          }
          this.captcha.reset();
        });
  }

  public ngAfterViewInit(): void {
    console.log(this.user.nativeElement);
    setTimeout(() => {
      this.user.nativeElement.focus();
    }, 10);

  }

  resolved(captchaResponse: string) {
    this.captchaResponse = captchaResponse;
  }

  close() {
    this.loginModal.hide();
  }


}

class Login {
  user: string;
  password: string;
  message: string;
  messageType: string;
}
