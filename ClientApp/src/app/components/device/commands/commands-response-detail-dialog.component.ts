import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoDTO, DeviceInfoService, PeriphericDTO, PeriphericValueDTO } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { AlertPanelComponent, AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsModel } from '../../../models/device/settings.model';
import { CommandDetailResponseModel } from 'src/app/models/device/commands/command-detail-response-model';


@Component({
  selector: 'commands-response-detail-dialog',
  templateUrl: './commands-response-detail-dialog.component.html',
  /*styleUrls: ['./settings.component.css', './settings.component.scss'],*/
})
export class CommandResponseDetailDialogComponent {

  deviceId: number;
  public model: CommandDetailResponseModel;

  constructor(
    public rs: LangService,
    public route: ActivatedRoute,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public logger: LoggerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.model = data.model;

    console.log("DeleteDeviceDialog.constructor()");
    console.log(this.model);
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
}
