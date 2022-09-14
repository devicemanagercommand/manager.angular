import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService, DeviceConnectionStateDTO } from '../../../services/device/device.service'
import { LangService } from '../../../services/shared/lang.service'
import { UserAuthConfiguration } from '../../../configuration/user.auth.configuration';
import { AlertPanel, AlertType } from '../../shared/alert.panel.component'
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TriggerHelper, HelperService } from '../../../services/shared/helper.service'
import { LoggerService } from "../../../services/shared/logger.service";
import { DeviceModel } from 'src/app/models/device/device.model';
import { UserService } from '../../../services/user/user.service';
import { UserInfoModel } from '../../../models/user/user-info.model';
import { SassHelperComponent } from '../../shared/sass-helper.component';
import { MessageService } from '../../../services/shared/message.service';
import { ConfigurationService } from '../../../services/shared/configuration.service';
import { SocketService } from '../../../services/shared/socket.service';
import * as moment from 'moment';
import { DeviceInfoDTO } from '../../../services/device/deviceInfo.service';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  animations: [
    TriggerHelper.sendToRight('routeAnimation'),
    TriggerHelper.connected()
  ]
})

export class DeviceComponent implements OnInit, OnDestroy {
  statusDeviceTimerActive: boolean;

  devices: DeviceModel[];
  public alertPanel: AlertPanel;
  private statusDeviceTimerSubscription: Subscription
  urlParamSubscription: Subscription;
  public userInfo: UserInfoModel;
  public innerWidth: number;

  @ViewChild(SassHelperComponent)
  public sassHelper: SassHelperComponent;
  public primary: string;
  public accent: string;
  public warn: string;
  public default: string;
  checkStatusTimerSubscription: Subscription;

  constructor(
    private deviceService: DeviceService,
    private userService: UserService,
    private activeRoute: ActivatedRoute,
    private rs: LangService,
    private router: Router,
    private authConfig: UserAuthConfiguration,
    public helper: HelperService,
    public logger: LoggerService,
    public messageService: MessageService,
    public ngZone: NgZone,
    public cnf: ConfigurationService,
    public socketService: SocketService,
  ) {
    console.log("DeviceComponent.Constructor()");
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.primary = this.sassHelper.readProperty('primary');
      this.warn = this.sassHelper.readProperty('warn');
      this.accent = this.sassHelper.readProperty('accent');
      this.default = this.sassHelper.readProperty('background-accent');
    }, 100);
  }

  showRemovedDevices(showRemovedDevicesParam: boolean) {
    this.devices.forEach((device: DeviceModel) => {
      if (device.removed) {
        device.showRemoved = showRemovedDevicesParam;
      }
    });
  }

  existsAnyRemovedDevice(): boolean {
    return !!this.devices.find(o => o.removed);
  }

  ngOnInit() {
    this.logger.debug("DeviceComponent.OnInit()")

    //Url parameters
    this.urlParamSubscription = this.activeRoute.params.subscribe(params => {
      this.cnf.init().subscribe(() => {

        const deviceToRemove = +params['idOfRemovedDevice'];// (+) converts string 'id' to a number
        this.logger.debug(`Id of removed Device ${deviceToRemove}`)
        this.deviceService.list().subscribe(async (rsp) => {

          this.logger.debug("DeviceService.List().susbscribe")
          this.devices = rsp as DeviceModel[];

          if (!this.devices || this.devices.length === 0) {
            this.alertPanel = new AlertPanel(this.rs.Resource("InfoWithoutDevices"), AlertType.Warning);
            throw this.rs.Resource("InfoWithoutDevices");
          }

          //Call when startConnection
          this.socketService.connectionEstablished.subscribe(() => {
            this.initSocketService();
          });

          await this.socketService.startConnection();

          this.socketService.onReconnecting(() => {
          });

          this.socketService.onReconnected(() => {
            this.initSocketService();
          });

          this.checkStatusTimerSubscription = this.deviceService.checkStatus_Timer().subscribe(() => {
            this.devices.forEach((device: DeviceModel) => {

              const current = moment();

              if (device.receiveFirstData) {
                const lastConnection = moment(device.lastConnection).local();
                const diff = current.diff(lastConnection, 'seconds');

                if (diff >= 10 && diff <= 15) {
                  device.state = "Disconnecting";
                }
                else if (diff > 15) {
                  device.state = "Disconnected";
                }
              }
              else {
                const diff2 = current.diff(device.receiveFirstDataTime, 'seconds');
                device.state = diff2 > 5 ? "Disconnected" : "Disconnecting";
              }
            });
          });

        }, (err) => { this.alertPanel = this.messageService.Error(err); });

        this.userService.getInfo().subscribe(
          o => this.userInfo = o,
          () => this.alertPanel = new AlertPanel(this.rs.Resource("InfoWithoutDevices"), AlertType.Warning)
        );



      });



    });
  }

  initSocketService() {
    this.devices.forEach((device) => {
      this.socketService.joinGroup("list" + device.userContractId + "-" + device.id)
      device.receiveFirstDataTime = moment();
      device.receiveFirstData = false;

      device.showRemoved = false;
    });

    this.socketService.receive<DeviceConnectionStateDTO>("DeviceStatus", (data: DeviceConnectionStateDTO) => {
      const device = this.devices.find(x => x.id === data.device.id && x.userContractId === data.device.userContractId);
      device.state = data.connectionState;
      device.lastConnection = data.lastConnection;
      device.lastConnectionToLocal = moment(data.lastConnection).local().format("dddd DD, MMM YYYY, HH:mm:ss");
      device.receiveFirstData = true;
    });
  }

  ngOnDestroy() {
    console.log("DeviceComponent.ngOnDestroy() ... stoping status device timer ...");
    if (this.statusDeviceTimerSubscription) {
      this.statusDeviceTimerSubscription.unsubscribe();
    }

    if (this.checkStatusTimerSubscription) {
      this.checkStatusTimerSubscription.unsubscribe();
    }

    if (this.urlParamSubscription) {
      this.urlParamSubscription.unsubscribe();
    }

    this.devices?.forEach((device) => {
      device.state = "Connected";
      this.socketService.disconnectGroup("list" + device.userContractId + "-" + device.id)
    });

  }

}
