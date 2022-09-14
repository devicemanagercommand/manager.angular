import { Injectable } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { DeviceModel } from 'src/app/models/device/device.model';
import { UserAuthService } from '../user/user.auth.service';
import { map } from 'rxjs/operators';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
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
    this.userAuthService.logout_event.subscribe(o => {
      this.dispose();
    });
  }

  list(): Observable<DeviceModel[]> {
    console.log("device.service.list")
    if (!this.devices) {
      return this.httpAuth.get("/api/device/device/list").pipe(map((devicesDTO: DeviceModel[]) => {
        this.devices = new Array<DeviceModel>();

        for (const deviceDTO of devicesDTO) {
          this.devices.push(
            new DeviceModel(
              "",
              deviceDTO.description,
              deviceDTO.id,
              deviceDTO.userContractId,
              deviceDTO.imei,
              deviceDTO.uniqueCode,
              deviceDTO.options,
              deviceDTO.coordinateOptions,
              deviceDTO.webCamOptions,
              deviceDTO.webCamNetwork,
              deviceDTO.state,
              deviceDTO.osId,
              deviceDTO.isShared,
              deviceDTO.removed,
              deviceDTO.roles
            ));
        }
        return this.devices;
      }));
    }
    else {
      return Observable.create(observer => { observer.next(this.devices); });
    }
  }

  checkStatus_Timer(): Observable<number> {
    return timer(1000, 1000);
  }

  delete(device: DeviceModel) {
    const deviceDTO = { id: device.id, userContractId: device.userContractId }
    const body = JSON.stringify(deviceDTO);

    return this.httpAuth.post(`/api/device/device/delete`, body).pipe(map(
      r => {
        this.devices = this.devices.filter(o => o.id != device.id);//Remove device of list
      }
    ));
  }

  keepAlive(keepAliveRequest: KeepAliveRequestDTO): Observable<KeepAliveResponseDTO> {
    const params = JSON.stringify(keepAliveRequest);
    return this.httpAuth.post<KeepAliveResponseDTO>("/api/device/device/keepAlive", params);
  }

  setActiveDevice(deviceId: number, userContractId: number): any {
    this.activeDevice = this.devices.filter(o => o.id == deviceId && o.userContractId == userContractId)[0];
  }
}


export class DeviceConnectionStateDTO {
  device: DeviceModel;
  lastConnection: string;
  connectionState: string;
}

export class KeepAliveResponseDTO {
  id: string;
  idDevice: string;
  maxAttempts: number;
  hasResponseFromDevice: boolean;
}

export class KeepAliveRequestDTO {
  DeviceId: number;
  CommandId: number;
  KeepAlive: boolean;
  UserContractId: number;
}
