import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { LangService } from '../../services/shared/lang.service'
import { UserAuthService } from '../../services/user/user.auth.service';
import { HelperService } from '../../services/shared/helper.service';
import { ComponentPipeService } from '../../services/shared/component.pipe.service';
import { UserInfoModel } from '../../models/user/user-info.model';
import { DialogService } from '../shared/dialog.component';
import { DeviceModel } from '../../models/device/device.model';

@Component({
  selector: 'device-nav-menu',
  templateUrl: './deviceNavMenu.component.html',
  styleUrls: [
    './deviceNavMenu.component.scss'
  ]
})

export class DeviceNavMenuComponent {

  showRemovedDevicesFlag = false;
  @Input() userInfo: UserInfoModel;
  innerWidth: number;

  @Input() devices: DeviceModel[];
  @Output() showRemovedDevices = new EventEmitter<boolean>();

  constructor(public rs: LangService,
    private userAuthService: UserAuthService,
    public helper: HelperService,
    private ds: DialogService,
  ) {
  }

  existsAnyDevicesRemoved() {
    return !!this.devices?.find(o => o.removed);
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:keydown', ['$event'])
  hotKey_Event(event: KeyboardEvent) {
    if (event.keyCode == 66 && event.altKey) {
      this.helper.backHistory();
    }
  }

  open() {
    //this.userAuthService.logout();
    const body = this.rs.Resource('ConfirmSignOut');
    const header = this.rs.Resource('LabelSignOut');
    this.ds.confirm(body, header).subscribe((resp: boolean) => {
      if (resp) {
        this.userAuthService.logout();
      } else {
        //this.ds.dialog.closeAll();
      }
    });
  }

  showRemovedDevicesAction() {
    this.showRemovedDevicesFlag = !this.showRemovedDevicesFlag;
    this.showRemovedDevices.emit(this.showRemovedDevicesFlag);
  }

}
