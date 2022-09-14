import { Component, Input } from '@angular/core';
import { DeviceModel } from '../../../models/device/device.model';
import { LangService } from '../../../services/shared/lang.service';

@Component({
  selector: 'dmc-module-title',
  templateUrl: './module-title.component.html',
  styleUrls: ['./module-title.component.scss']
})
/** module-title component*/
export class ModuleTitleComponent {

  @Input() banner: string;
  @Input() tooltipBanner: string;
  @Input() device: DeviceModel;
  @Input() rootClass: string;

  /** module-title ctor */
  constructor(
    public rs: LangService
  ) {
  }
}
