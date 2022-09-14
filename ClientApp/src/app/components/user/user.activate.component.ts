import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { LangService } from '../../services/shared/lang.service'
import { AlertPanel } from '../shared/alert.panel.component'
import { RecaptchaComponent } from 'ng-recaptcha'
import { LoadingComponent } from '../shared/loading.component'

@Component({
  selector: 'user.activate',
  templateUrl: './user.activate.component.html',
  styleUrls: ['./user.activate.component.scss']
})
export class UserActivateComponent implements OnInit, OnDestroy {
  successAlertPanel: AlertPanel;
  errorAlertPanel: AlertPanel;
  @ViewChild('captcha') captcha: RecaptchaComponent;
  @ViewChild('loading') loading: LoadingComponent;

  captchaResponse: string;
  result = "warning";
  private sub: any;

  constructor(
    public rs: LangService,
    public formBuilder: UntypedFormBuilder,
    public route: ActivatedRoute
  ) {
    this.captchaResponse = null;

  }

  ngOnInit() {
    this.sub = this.route.params
      .subscribe(params => {
        this.result = params['result'];
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response ${captchaResponse}:`);
    this.captchaResponse = captchaResponse;
  }
}
