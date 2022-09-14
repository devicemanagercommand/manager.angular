import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators, } from '@angular/forms';
import { LangService } from '../../services/shared/lang.service'
import { HttpHeaderService } from '../../services/shared/http.header.service'
import { UserService, PasswordForgotDTO } from '../../services/user/user.service'
import { AlertPanel, AlertType } from '../shared/alert.panel.component'
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { DOCUMENT } from '@angular/common';
import { HelperService, TriggerHelper } from '../../services/shared/helper.service';
import { finalize } from 'rxjs/operators';


@Component({
  host: { '[@sendToRightAnimation]': '' },
  selector: 'user.password.forgot',
  templateUrl: './user.password.forgot.component.html',
  styleUrls: ['./user.password.forgot.component.scss'],
  animations: [TriggerHelper.opacityPageWithNav("sendToRightAnimation")]
}
)
export class PasswordForgotComponent implements OnInit, OnDestroy {
  successAlertPanel: AlertPanel;
  errorAlertPanel: AlertPanel;
  isLoading = false;

  public passwordForgotForm = this.formBuilder.group({
    mail: ["", [
      Validators.required,
      Validators.maxLength(250),
      Validators.pattern("^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,15})$")
      //"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
    ]],
  });

  get mail() { return this.passwordForgotForm.get('mail'); }
  captchaResponse: string;
  submitted: boolean;

  constructor(
    @Inject(DOCUMENT) private _document: any,
    public rs: LangService,
    public formBuilder: UntypedFormBuilder,
    public userService: UserService,
    private httpHeaderService: HttpHeaderService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    public helper: HelperService
  ) {
    this.submitted = false;
  }

  ngOnInit(): void {
    this._document.body.classList.add('recaptcha');
  }
  ngOnDestroy(): void {
    this._document.body.classList.remove('recaptcha');

  }

  submit(event: Event) {
    this.reCaptchaV3Service
      .execute('importantAction')
      .subscribe((token) => {

        console.log("PasswordForgotComponent.submit()");
        event.preventDefault();

        const passwordForgot = new PasswordForgotDTO();
        passwordForgot.mail = this.mail.value;
        passwordForgot.captchaResponse = token;

        this.isLoading = true;

        this.userService.passwordForgot(passwordForgot)
          .pipe(
            finalize(() => this.isLoading = false)
          )
          .subscribe((rsp: any) => {
            this.submitted = true;
            console.log(`PasswordForgotComponent.submit() success = ${rsp}`);
            this.successAlertPanel = new AlertPanel(rsp.message, AlertType.Success);
          }, (err) => {
            console.log(`PasswordForgotCompoentn.submit() error = ${err}`);
            const rsp = err;

            let alertType = AlertType.Warning;
            if (rsp.type === "Error")
              alertType = AlertType.Danger;

            this.errorAlertPanel = new AlertPanel(rsp.message, alertType);
          });
      });
  }
}

