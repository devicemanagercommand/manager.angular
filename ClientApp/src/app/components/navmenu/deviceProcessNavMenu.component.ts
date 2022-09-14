import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeviceService } from '../../services/device/device.service';
import { LangService } from '../../services/shared/lang.service'
import { UserAuthService } from '../../services/user/user.auth.service';
import { ProcessOptionsComponent } from '../device/process/process.options.component';

@Component({
  selector: 'device-process-nav-menu',
  templateUrl: './deviceProcessNavMenu.component.html',
  styleUrls: [
    './deviceProcessNavMenu.component.scss'
  ]
})

export class DeviceProcessNavMenuComponent {
  constructor(public rs: LangService,
    private userAuthService: UserAuthService,
    private dialog: MatDialog,
    private deviceService: DeviceService
  ) {
  }

  showOptions() {
    const dialogRef = this.dialog.open(ProcessOptionsComponent, {
      data: { deviceService: this.deviceService }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { }
    });

  }

}

