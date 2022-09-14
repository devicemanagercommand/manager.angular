import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoDTO, DeviceInfoService, PeriphericDTO, PeriphericValueDTO } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AlertPanel } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { ModalComponent } from "../../shared/modal.component";
import { TriggerHelper } from "../../../services/shared/helper.service";
import { DeviceService } from '../../../services/device/device.service';
import { finalize } from 'rxjs/operators';
import { UserAuthService } from '../../../services/user/user.auth.service';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'device-info',
  templateUrl: './device.info.component.html',
  styleUrls: ['device.info.component.scss'],
  animations:
    [TriggerHelper.opacity('peripherycState'), TriggerHelper.sendToLeft('routeAnimation'),
    ]
  ,
})
export class DeviceInfoComponent implements OnInit, OnDestroy {

  getAllPeripherycsTimerSubscriptionIsActive: any;
  deviceId: number;
  public model: DeviceInfoDTO;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;
  private getAllPeripherycsTimerSubscription: Subscription;
  public accordionClass = 'c-panel';

  @ViewChild('peripheralModal') private peripheralModal: ModalComponent;
  @ViewChild('peripheralValueModal') private peripheralValueModal: ModalComponent;
  userContractId: number;

  constructor(
    public rs: LangService,
    public route: ActivatedRoute,
    public deviceInfoService: DeviceInfoService,
    public deviceService: DeviceService,
    public messageService: MessageService,
    public logger: LoggerService,
    public auth: UserAuthService
  ) {
    console.log("DeviceInfoComponent.constructor()");
  }

  ngOnInit() {
    //Url parameters
    this.urlParamSubscription = this.route.params.subscribe(params => {
      this.deviceId = +params['id'];// (+) converts string 'id' to a number
      this.userContractId = +params['userContractId'];

      this.getAllPeripherycsTimerSubscriptionIsActive = true;

      this.deviceInfoService.getAllPeripherycs(this.deviceId, this.userContractId)
        .pipe(
          finalize(() => this.getAllPeripherycsTimerSubscriptionIsActive = false)
        )
        .subscribe(rsp => {
          this.loadModel(rsp as DeviceInfoDTO);
        }, err => {
          console.error(err);
          this.alert = this.messageService.alert(err)
        });
    });

    this.getAllPeripherycsTimerSubscription = this.deviceInfoService.getAllPeripherycs_Timer()
      .subscribe(() => {
        console.log("DeviceInforComponent.ngOnInit().getAllPeripherycs_Timer");
        if (this.deviceId
          && !this.getAllPeripherycsTimerSubscriptionIsActive
          && this.userContractId) {
          this.getAllPeripherycsTimerSubscriptionIsActive = true;

          this.deviceInfoService.getAllPeripherycs(this.deviceId, this.userContractId)
            .pipe(
              finalize(() => this.getAllPeripherycsTimerSubscriptionIsActive = false)
            )
            .subscribe(rsp => {
              this.loadModel(rsp);
            }
              , err => {
                console.error(err);
                this.alert = this.messageService.alert(err)
              });
        }
      });
  }

  loadModel(deviceInfo: DeviceInfoDTO) {
    this.deviceService.list().subscribe(o => {

      this.deviceService.setActiveDevice(deviceInfo.device.id, this.userContractId);
      deviceInfo.device = this.deviceService.activeDevice;

      this.model = Object.assign(new DeviceInfoDTO(), deviceInfo);

      this.model.peripherycTypes.find(x => x.id === 1).peripherycs[0].expanded = true;
      this.model.peripherycTypes.find(x => x.id === 1).activeCss = "active";
      this.model.peripherycTypes.find(x => x.id === 1).inCss = "in";
      this.model.peripherycTypes.find(x => x.id === 1).peripherycs[0].inCss = "in";

      console.log(new Date().getTimezoneOffset());

      for (const peripheralTypes of this.model.peripherycTypes) {
        for (const peripheral of peripheralTypes.peripherycs) {
          for (const value of peripheral.peripherycValues) {
            //value.lastUpdate = ;// value.lastUpdate
          }
        }
      }
    });
  }

  trackById(index, item) {
    return item.id;
  }

  confirmRemovePeripheral(peripheryc: PeriphericDTO) {
    this.peripheralModal.open(peripheryc);
    this.peripheralModal.body = this.rs.Resource("ConfirmRemove") + " '" + peripheryc.name + "'";
  }

  confirmRemovePeripheralValue(peripheral: PeriphericValueDTO) {
    console.debug("DeviceInfoCompoenente.ConfirmRemovePeripheralValue ... ");
    this.peripheralValueModal.body = this.rs.Resource("ConfirmRemove") + " '" + peripheral.fieldName + "'";
    this.peripheralValueModal.open(peripheral);
  }

  removePeripheral(peripheryc: PeriphericDTO) {

    this.logger.debug(peripheryc);
    this.deviceInfoService.removePeripheral(peripheryc)
      .subscribe(o => {
        console.debug(o);
        let peripheralsTypes = this.model.peripherycTypes.find(x => x.id == peripheryc.periphericTypeId);
        peripheralsTypes.peripherycs = peripheralsTypes.peripherycs.filter(x => x.id !== peripheryc.id);
      }
        , (error) => {
          console.error("error:" + error);
          error = error;
          this.alert = new AlertPanel(error.message, error.type);
        });
  }

  removePeripheralValue(peripheralValue: PeriphericValueDTO) {
    this.deviceInfoService.removePeripheralValue(peripheralValue)
      .subscribe(o => {
        console.debug(o);
        //var peripheralsTypes = this.model.peripherycTypes.find(x => x.id == peripheryc);
        //peripheralsTypes.peripherycs = peripheralsTypes.peripherycs.filter(x => x.id !== peripheryc.id);
      }
        , (error) => {
          console.error("Error:" + error);
          error = error;
          this.alert = new AlertPanel(error.message, error.type);
        });
  }



  ngOnDestroy() {
    this.urlParamSubscription.unsubscribe();
    this.getAllPeripherycsTimerSubscription.unsubscribe();
  }
}
