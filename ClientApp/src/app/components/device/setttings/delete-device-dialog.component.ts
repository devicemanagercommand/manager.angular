import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoService } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { AlertPanelComponent, AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { SettingsModel } from '../../../models/device/settings.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'device-settings-info',
  templateUrl: './delete-device-dialog.component.html',
})
export class DeleteDeviceDialogComponent {

  deviceId: number;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;
  public model: SettingsModel;

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
}
