import { Component, ViewChild, OnDestroy, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators, FormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '../../services/shared/lang.service'
import { HttpHeaderService } from '../../services/shared/http.header.service'
import { HelperService, TriggerHelper } from '../../services/shared/helper.service'
import { UserService, SignUpDTO } from '../../services/user/user.service'
import { AlertPanel, AlertType } from '../shared/alert.panel.component'
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { finalize } from 'rxjs/operators';

@Component({
  host: { '[@sendToRightAnimation]': '' },
  selector: 'user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss'],
  animations: [TriggerHelper.opacityPageWithNav("sendToRightAnimation")]
}
)
export class UserRegisterComponent implements OnDestroy, OnInit {
  successAlertPanel: AlertPanel;
  errorAlertPanel: AlertPanel;
  isLoading = false;

  public registerForm = this.formBuilder.group({
    userName: ["", [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern("^([A-Za-z]*[ ]?[A-Za-z]*)*$")
    ]],
    user: ["", [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern("^([A-Za-z0-9]*[\\._]?[A-Za-z0-9]+)*$")
    ]],
    mail: ["", [
      Validators.required,
      Validators.maxLength(250),
      Validators.pattern("^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,15})$")
      //"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
    ]],
    passwords: this.formBuilder.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      retypePassword: ["", [Validators.required, Validators.minLength(6)]],
    }, { validator: this.areEqual }),
  });

  private recaptchaV3ServiceSubscribe: Subscription;
    isMobile: boolean;


  get userName() { return this.registerForm.get('userName'); }
  get user() { return this.registerForm.get('user'); }
  get password() { return this.registerForm.get('passwords').get('password'); }
  get retypePassword() { return this.registerForm.get('passwords').get('retypePassword'); }
  get mail() { return this.registerForm.get('mail'); }
  get passwords() { return this.registerForm.get('passwords'); }
  captchaResponse: string;
  submitted: boolean;


  constructor(
    @Inject(DOCUMENT) private _document: any,
    public rs: LangService,
    public formBuilder: UntypedFormBuilder,
    public userService: UserService,
    private httpHeaderService: HttpHeaderService,
    public helper: HelperService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) {
    this.captchaResponse = null;
    this.submitted = false;
  }

  ngOnInit(): void {
    this._document.body.classList.add('recaptcha');
      }

  ngOnDestroy(): void {
    this._document.body.classList.remove('recaptcha');

  }

  submit(event: Event) {
    this.recaptchaV3Service
      .execute('importantAction')
      .subscribe((token) => {

        this.captchaResponse = token

        console.log("sign.up.submit");
        event.preventDefault();

        const signUpDTO = new SignUpDTO();
        signUpDTO.user = this.user.value;
        signUpDTO.password = this.passwords.get('password').value;
        signUpDTO.mail = this.mail.value;
        signUpDTO.name = this.userName.value;
        signUpDTO.captchaResponse = this.captchaResponse;

        this.isLoading = true;
        this.userService.signUp(signUpDTO)
          .pipe(
            finalize(() => this.isLoading = false)
          )
          .subscribe((rsp: any) => {
            this.submitted = true;
            console.log(`signUp.success = ${rsp}`);
            this.successAlertPanel = new AlertPanel(rsp.message, AlertType.Success)
          }, (err) => {
            console.log(`signUp.Error = ${err}`);
            let rsp = err.error;

            let alertType = AlertType.Warning;
            if (rsp.type === "Error")
              alertType = AlertType.Danger;

            this.errorAlertPanel = new AlertPanel(rsp.message, alertType)
          });
      });

  }



  areEqual(group: UntypedFormGroup) {
    const valid = false;

    let val = "";
    for (const name in group.controls) {
      val = group.controls[name].value;
      break;
    }

    for (const name in group.controls) {
      if (val != group.controls[name].value) {
        return {
          areEqual: true
        };
      }
    }

    if (valid) {
      return null;
    }
  }
}

