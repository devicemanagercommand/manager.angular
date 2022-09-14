import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject, isDevMode } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoDTO, DeviceInfoService, PeriphericDTO, PeriphericValueDTO } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { AlertPanelComponent, AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MatRadioChange } from '@angular/material/radio';
import { CommandsModel } from '../../../models/device/commands.model';
import { FormGroup, UntypedFormBuilder, Validators, NgForm } from '@angular/forms';
import { CommandOptionModel } from '../../../models/device/commands/command-option.model';
import { CommandControlModel } from '../../../models/device/commands/command-control.model';
import { CommandService } from '../../../services/device/command.service';
import { CommandModel } from '../../../models/device/commands/command.model';
import { CommandActionModel } from 'src/app/models/device/commands/command-action.model';

@Component({
  selector: 'step-command',
  templateUrl: './step-command.component.html',
  styleUrls: ['./step-command.component.scss'],
})
export class StepCommandComponent {
  deviceId: number;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;
  isLinear = false;

  @ViewChild('commandStepForm') public get commandStepForm(): NgForm {
    return this.commandService.model.commandStepForm;
  }

  public set commandStepForm(value: NgForm) {
    this.commandService.model.commandStepForm = value;
  }

  test: string;

  constructor(
    public rs: LangService,
    public route: ActivatedRoute,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public logger: LoggerService,
    private _formBuilder: UntypedFormBuilder,
    public commandService: CommandService,
  ) {
  }

  ngOnInit() {

  }

  commandChange(event: MatRadioChange) {
    let c: CommandModel = event.value;

    this.commandService.model.newCustomControl.commandId = c.id;
    //this.commandService.loadCommandControl(cc);
    this.commandService.model.commandStepName = c.name;

    for (let opt of this.commandService.model.newCustomControl.commandOptions) {
      if (c.id == this.commandService.model.newCustomControlIfCancel.commandId) {
        var optIfCancel = this.commandService.model.newCustomControlIfCancel.commandOptions.find(o => o.id == opt.id);
        opt.commandActions = optIfCancel.commandActions;
      }
      else {
        opt.commandActions = new Array<CommandActionModel>();
      }
    }
  }

  esm = {
    isErrorState: () => { return true }
  }

}



  //ngOnInit() {
  //  //Url parameters
  //  this.urlParamSubscription = this.route.params.subscribe(params => {
  //    this.deviceId = +params['id'];// (+) converts string 'id' to a number

  //  });
  //}


  //ngOnDestroy() {
  //  this.urlParamSubscription.unsubscribe();
  //}
