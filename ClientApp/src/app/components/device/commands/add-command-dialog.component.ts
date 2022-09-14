import { Component, OnInit, OnDestroy } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoService } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { AlertPanel } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MatRadioChange } from '@angular/material/radio';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { CommandControlModel } from '../../../models/device/commands/command-control.model';
import { CommandService } from '../../../services/device/command.service';
import { TriggerHelper } from 'src/app/services/shared/helper.service';
import { DeviceService, KeepAliveRequestDTO } from '../../../services/device/device.service';


@Component({
  host: {
    '[@routeAnimation]': ''
  },
  templateUrl: './add-command-dialog.component.html',
  animations: [TriggerHelper.opacity('peripherycState'), TriggerHelper.sendToRight('routeAnimation')],
  styleUrls: ['./add-command-dialog.component.scss']
})
export class AddCommandDialogComponent implements OnInit, OnDestroy {
  deviceId: number;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;

  isLinear = false;
  secondFormGroup: UntypedFormGroup;
  test: string;
  keepAliveTimerActive: any;
  deviceState: string;
  isLoading: boolean;
  keepAliveTimerSubscription: Subscription;
  userContractId: number;

  constructor(
    public rs: LangService,
    public route: Router,
    public activeRoute: ActivatedRoute,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public logger: LoggerService,
    private _formBuilder: UntypedFormBuilder,
    public commandService: CommandService,
    public deviceService: DeviceService,
  ) {
    console.log("AddCommandDialogComponent.constructor()");
    console.log(this.commandService.model);
  }

  ngOnInit() {
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    //Url parameters
    this.urlParamSubscription = this.activeRoute.params.subscribe(params => {

      this.deviceId = +params['id'];// (+) converts string 'id' to a number
      this.userContractId = +params['userContractId'];

      if (!this.commandService.model || !this.commandService.model.newCustomControl) {
        this.route.navigate(['/devices/commands', this.deviceId, this.userContractId]);
      }
      else if (this.commandService.model.newCustomControl) {
        this.commandService.model.controlStepName = this.rs.Resource(this.commandService.model.newCustomControl.commandControl.name);
        if (this.commandService.model.newCustomControl.command) {
          this.commandService.model.commandStepName = this.commandService.model.newCustomControl.command.name;
        }
      }

      this.keepAliveTimerSubscription = this.deviceService.checkStatus_Timer()
        .subscribe(rsp => {
          if (!this.keepAliveTimerActive) {
            this.keepAliveTimerActive = true;

            const keepAliveRequest = new KeepAliveRequestDTO();
            keepAliveRequest.CommandId = null;
            keepAliveRequest.DeviceId = this.deviceId;
            keepAliveRequest.UserContractId = this.deviceService.activeDevice.userContractId;
            keepAliveRequest.KeepAlive = true;

            this.deviceService.keepAlive(keepAliveRequest)
              .pipe(
                finalize(() => this.keepAliveTimerActive = false)
              ).subscribe(kaRsp => {
                const keepAliveResponse = kaRsp;
                this.deviceState =
                  keepAliveResponse.hasResponseFromDevice
                    ? "Connected" : "Disconecting";

                if (this.deviceState == "Connected") {
                  this.isLoading = false;
                }

              }, (err) => {
                console.log("Error keepalive, see the next line:")
                console.log(err);
                if (err.status != 200) {
                  this.deviceState = "Disconnecting";
                }
              });
          }
        });
    });
  }

  cancel() {
    this.commandService.cancel();//Don't execute this method after cleanAddNewCustomControl

    this.commandService.cleanAddNewCustomControl();

    this.route.navigate(['/devices/commands', this.deviceId, this.userContractId]);
  }

  commandControlChange(event: MatRadioChange) {
    let cc: CommandControlModel = event.value;
    this.commandService.loadCommandControl(cc);
  }

  esm = {
    isErrorState: () => { return true }
  }

  ngOnDestroy(): void {
    console.log("ProcessComponent.ngOnDestroy()");
    this.urlParamSubscription.unsubscribe();
    if (this.keepAliveTimerSubscription)
      this.keepAliveTimerSubscription.unsubscribe();
  }
}


