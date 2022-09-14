import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { LangService } from '../../services/shared/lang.service'
import { HttpHeaderService } from '../../services/shared/http.header.service'
import { UserService, PasswordRecoveryDTO } from '../../services/user/user.service'
import { AlertPanel, AlertType } from '../shared/alert.panel.component'
import { MessageService } from '../../services/shared/message.service'
import { Subscription } from 'rxjs'
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'user.password.recovery',
  templateUrl: './user.password.recovery.component.html',
  styleUrls: ['./user.password.recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit, OnDestroy {
  tocken: string;
  isFromMail: boolean;
  userId: number;
  routerParamsSubscripion: Subscription;

  successAlertPanel: AlertPanel;
  errorAlertPanel: AlertPanel;
  isLoading = false;

  public passwordRecoveryForm = this.formBuilder.group({
    passwords: this.formBuilder.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      retypePassword: ["", [Validators.required, Validators.minLength(6)]],
    }, { validator: this.areEqual }),
  });

  get password() { return this.passwordRecoveryForm.get('passwords').get('password'); }
  get retypePassword() { return this.passwordRecoveryForm.get('passwords').get('retypePassword'); }
  get passwords() { return this.passwordRecoveryForm.get('passwords'); }
  captchaResponse: string;
  submitted: boolean;

  constructor(
    public rs: LangService,
    public formBuilder: UntypedFormBuilder,
    public userService: UserService,
    private httpHeaderService: HttpHeaderService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.captchaResponse = null;
    this.submitted = false;
  }

  ngOnInit() {
    console.log("PassowrdRecovery.ngOnInit()")
    this.routerParamsSubscripion = this.route.params
      .subscribe(params => {
        this.userId = +params['userId'];
        this.isFromMail = params['isFromMail'];
        this.tocken = params['tocken'];

      }, (err => {
        this.errorAlertPanel = this.messageService.alert(err);
      })
      );
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response ${captchaResponse}:`);
    this.captchaResponse = captchaResponse;
  }

  submit(event: Event) {
    console.log("PasswordRecovery.submit()");
    event.preventDefault();

    const passwordRecovery = new PasswordRecoveryDTO();
    passwordRecovery.password = this.password.value;
    passwordRecovery.retypePassword = this.retypePassword.value;
    passwordRecovery.isFromMail = +this.isFromMail === 1 ? true : false;
    passwordRecovery.userId = this.userId;
    passwordRecovery.tocken = this.tocken;
    passwordRecovery.captchaResponse = this.captchaResponse;

    this.isLoading = true;
    this.userService.passwordRecovery(passwordRecovery)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe((rsp: any) => {
        this.submitted = true;
        console.log(`PasswordRecovery.userService.passwordRecovery() success = ${rsp}`);
        this.successAlertPanel = new AlertPanel(rsp.message, AlertType.Success)
      }, (err) => {
        //this.captcha.reset();
        this.errorAlertPanel = this.messageService.alert(err);
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
      if (val !== group.controls[name].value) {
        return {
          areEqual: true
        };
      }
    }

    if (valid) {
      return null;
    }
  }

  ngOnDestroy() {
    this.routerParamsSubscripion.unsubscribe();
  }



}

