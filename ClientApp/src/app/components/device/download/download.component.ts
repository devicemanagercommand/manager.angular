import { Component, OnInit } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { HelperService, OsBinaryHash, TriggerHelper } from '../../../services/shared/helper.service'
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
  animations: [TriggerHelper.sendToLeft('routeAnimation')]
})
export class DownloadComponent {

  public linuxCommand = `wget https://devicemanagercommand.com/api/device/helper/download/installer.sh -O installer.sh && 
chmod +x installer.sh && 
./installer.sh`


  constructor(
    public rs: LangService,
    public helper: HelperService,
    public clipboardApi: Clipboard,
  ) {

  }

  copyText() {
    this.clipboardApi.copy(this.linuxCommand);
  }

}
