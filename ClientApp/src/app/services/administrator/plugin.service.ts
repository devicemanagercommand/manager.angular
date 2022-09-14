import { Injectable } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { DeviceModel } from 'src/app/models/device/device.model';
import { UserAuthService } from '../user/user.auth.service';
import { PluginUploadModel } from '../../models/administrator/plugins/plugin.upload.model';

@Injectable({
  providedIn: 'root',
})
export class PluginService {
  dispose(): any {
    this.devices = null;
    this.activeDevice = null;
  }

  public activeDevice: DeviceModel;
  public devices: DeviceModel[];

  constructor(
    private httpAuth: HttpAuthService,
    private userAuthService: UserAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService
  ) {
    console.log("Device.Service.constructor");
    this.userAuthService.logout_event.subscribe(() => {
      this.dispose();
    });
  }

  upload(pluginUpload: PluginUploadModel) {
    console.log("PluginService.Upload");

    const body = JSON.stringify(pluginUpload);
    return this.httpAuth.post(`/api/plugin/plugin/upload`, body);
  }

}

