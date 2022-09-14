import { Component, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { LangService } from '../../services/shared/lang.service'
import { HelperService } from '../../services/shared/helper.service'
import { UserAuthService } from '../../services/user/user.auth.service';
import { ModalComponent } from '../shared/modal.component'
import { DeviceModel } from '../../models/device/device.model';

@Component({
  selector: 'device-header-nav-menu',
  templateUrl: './device-header-nav-menu.component.html',
  styleUrls: ['./device-header-nav-menu.component.scss']
})

export class DeviceLeftNavMenuComponent {
  @Input() banner: string;
  @Input() tooltipBanner: string;
  @Input() device: DeviceModel;
  @Input() rootClass: string;
  @Input() showBackButton = true;
  @Input() showMenuButton = true;
  @Input() canBackHistory = true;

  @Output() back = new EventEmitter();


  @ViewChild("dmcModal") dmcModal: ModalComponent;
  constructor(
    public rs: LangService,
    private userAuthService: UserAuthService,
    public helper: HelperService
  ) {

  }

  backHistory() {
    this.back.emit();
    if (this.canBackHistory) {
      this.helper.backHistory();
    }
  }


  @HostListener('window:keydown', ['$event'])
  hotKey_Event(event: KeyboardEvent) {
    if (event.keyCode == 66 && event.altKey) {
      this.helper.backHistory();
    }
  }
}
