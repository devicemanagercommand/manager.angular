import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { finalize } from 'rxjs/operators';
import { ContactModel } from '../../../models/home/contact.model';
import { HelperService, TriggerHelper } from '../../../services/shared/helper.service';
import { LangService } from '../../../services/shared/lang.service';
import { MessageService } from '../../../services/shared/message.service';
import { UserService } from '../../../services/user/user.service';
import { AlertPanel, AlertType } from '../../shared/alert.panel.component';

@Component({
  selector: 'dmc-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: { '[@opacity]': '' },
  animations: [TriggerHelper.opacityPageWithNav("opacity")]
})

export class ContactComponent implements OnInit {

  public model: ContactModel;
  public alertPanel: AlertPanel;

  constructor(
    public rs: LangService,
    public helper: HelperService,
    public userService: UserService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private messageService: MessageService,
    @Inject(DOCUMENT) private _document: any,
  ) {
  }

  ngOnInit(): void {
    this._document.body.classList.add('recaptcha');

    this.model = new ContactModel();
  }

  ngOnDestroy(): void {
    this._document.body.classList.remove('recaptcha');

  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public send() {
    console.debug("send()", this.model)

    this.model.isLoading = true;

    this.recaptchaV3Service
      .execute('importantAction')
      .subscribe((token) => {

        this.model.captcha = token;

        this.userService.sendContactMessage(this.model)
          .pipe(finalize(() => this.model.isLoading = false))
          .subscribe(() => {
            this.alertPanel = new AlertPanel(this.rs.Resource("LabelSuccess"), AlertType.Success)
          }, (err) => {
            console.log(`message.Error = `, err);
            this.alertPanel = this.messageService.Error(err);
          });
      });
  }
}
