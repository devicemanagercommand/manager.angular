import { Injectable } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { LoggerService } from "../shared/logger.service";
import { AlertPanel } from "../../components/shared/alert.panel.component";
import { DeviceModel } from '../../models/device/device.model';
import * as moment from 'moment';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceInfoService {
  public alert: AlertPanel;
  constructor(
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService,
    private logger: LoggerService
  ) {
    console.log("Device.Service.constructor");
  }

  getAllPeripherycs(deviceId: number, userContractId: number): Observable<DeviceInfoDTO> {
    console.log("deviceInfo.service.get")
    return this.httpAuth.get<DeviceInfoDTO>(`/api/device/device/info/${deviceId}/${userContractId}`);
  }

  getAllPeripherycs_Timer(): Observable<number> {
    console.log("DeviceService.getAllPeripherics_Timer()");
    return timer(1000, 5000);
  }

  removePeripheral(peripheryc: PeriphericDTO): Observable<any> {
    this.logger.debug("DeviceInfoService.removePeripheryc " + peripheryc.name)
    const body = JSON.stringify(peripheryc);
    return this.httpAuth.post("/api/device/device/removeperipheral", body);
  }
  removePeripheralValue(peripheralValue: PeriphericValueDTO) {
    this.logger.debug("DeviceInfoService.removePeripheryc " + peripheralValue.fieldName);
    const body = JSON.stringify(peripheralValue);
    return this.httpAuth.post("/api/device/device/removeperipheralvalue", body);
  }

}

export class DeviceInfoDTO {
  device: DeviceModel;
  peripherycTypes: PeriphericTypeModelDTO[];
}

export class PeriphericDTO {
  inCss: string;
  periphericTypeId: number;
  name: string;
  peripherycValues: PeriphericValueDTO[];
  deviceId: number;
  id: number;
  lastUpdate: string;
  expanded: boolean;

  lastUpdateToLocal(): string {
    if (this.lastUpdate)
      return moment.utc(this.lastUpdate).toDate().toString();
    else
      return null;
  }
}

export class PeriphericValueDTO {
  value: string;
  fieldName: string;
  lastUpdate: string;
  peripheralTypeId: number;
  deviceId: number;
  peripheralId: number;

  lastUpdateToLocal(): string {
    if (this.lastUpdate)
      return moment.utc(this.lastUpdate).toDate().toString();
    else
      return null;
  }
}

export class PeriphericTypeModelDTO {
  activeCss: string;//If start actived in tab
  inCss: string;//If start actived in tab
  id: number;
  name: string;
  isNew: boolean;
  peripherycs: PeriphericDTO[];
}
