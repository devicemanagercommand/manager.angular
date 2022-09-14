import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoService } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { MessageService } from "../../../services/shared/message.service";
import { TriggerHelper } from "../../../services/shared/helper.service";
import { MatDialog } from '@angular/material/dialog';
import { DeleteDeviceDialogComponent } from './delete-device-dialog.component';
import { DeviceService } from '../../../services/device/device.service';
import { SettingsModel } from '../../../models/device/settings.model';
import { ResourceService } from '../../../services/device/resource.service';
import { UserService } from '../../../services/user/user.service';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'device-settings-info',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    TriggerHelper.opacity('opacity'),
    TriggerHelper.sendToLeft('routeAnimation')
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {

  deviceId: number;
  public model: SettingsModel;
  urlParamSubscription: Subscription;
  public isLoading = false;

  constructor(
    public rs: LangService,
    public activeRoute: ActivatedRoute,
    public route: Router,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public dialog: MatDialog,
    public deviceService: DeviceService,
    public resourceService: ResourceService,
    public userService: UserService

  ) {
  }

  ngOnInit() {
    //Url parameters
    this.urlParamSubscription = this.activeRoute.params.subscribe(params => {

      this.deviceId = +params['id'];// (+) converts string 'id' to a number
      const userContractId = +params['userContractId'];
      this.deviceService.list().subscribe((o) => {

        this.deviceService.setActiveDevice(this.deviceId, userContractId);
        this.model = new SettingsModel(this.deviceService.activeDevice);

      });
    });
  }

  confirmDelete() {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      data: { model: this.model }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result === true) {
        console.log(`Dialog result: ${result}`);
        this.deviceService.delete(this.model.device).subscribe((r) => {
          console.debug("confirmDelte sucess redirecting")
          this.route.navigate(['/devices']);
        });
      }
    });
  }


  ngOnDestroy() {
    this.urlParamSubscription.unsubscribe();
  }
}
