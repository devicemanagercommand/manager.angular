import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject, AfterViewInit } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoDTO, DeviceInfoService, PeriphericDTO, PeriphericValueDTO } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { AlertPanelComponent, AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommandsModel } from '../../../models/device/commands.model';
import { FormGroup, UntypedFormBuilder, Validators, NgForm } from '@angular/forms';
import { CommandOptionModel } from '../../../models/device/commands/command-option.model';
import { CommandControlModel } from '../../../models/device/commands/command-control.model';
import { CommandService } from '../../../services/device/command.service';


@Component({
  selector: 'step-control',
  templateUrl: './step-control.component.html',
  styleUrls: ['./step-control.component.scss'],
})
export class StepControlComponent {
  deviceId: number;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;

  isLinear = false;
  @ViewChild('firstStepForm') public get firstStepForm(): NgForm {
    return this.commandService.model.controlStepForm;
  }

  public set firstStepForm(value: NgForm) {
    this.commandService.model.controlStepForm = value;
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
    public snackBar: MatSnackBar
  ) {
  }


  ngOnInit() {
  }

  commandControlChange(event: MatRadioChange) {
    let cc: CommandControlModel = event.value;

    this.commandService.loadCommandControl(cc);
  }

  esm = {
    isErrorState: () => { return true }
  }

  addOption() {
    if (this.commandService.model.commandConfiguration.maxOptions <= this.commandService.model.newCustomControl.commandOptions.length) {
      this.snackBar.open(this.rs.Resource("WarnMaxItems"), null, { duration: 1500 });
    }
    else {
      this.commandService.addOption();
    }
  }

  removeOption() {
    this.commandService.removeOption();
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
