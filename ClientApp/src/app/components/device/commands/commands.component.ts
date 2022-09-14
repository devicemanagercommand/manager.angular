import { Component, OnInit, OnDestroy } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoService } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { TriggerHelper } from "../../../services/shared/helper.service";
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceService, KeepAliveRequestDTO } from '../../../services/device/device.service';
import { InvokerService, InvokerMethodResponse, InvokerMethodResponseType } from '../../../services/device/invoker.service';
import { CommandService } from '../../../services/device/command.service';
import { CommandOptionModel } from '../../../models/device/commands/command-option.model';
import { Overlay } from '@angular/cdk/overlay';
import { DialogService, DialogType } from '../../shared/dialog.component';
import { CommandCustomControlModel } from 'src/app/models/device/commands/command-custom-control.model';
import { finalize } from 'rxjs/operators';
import { TerminalLine } from 'src/app/services/device/process.service';
import { CommandDetailResponseModel } from 'src/app/models/device/commands/command-detail-response-model';
import { CommandResponseDetailDialogComponent } from './commands-response-detail-dialog.component';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'device-commands-info',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  animations: [TriggerHelper.opacity('opacity'), TriggerHelper.sendToLeft('routeAnimation')],
})
export class CommandsComponent implements OnInit, OnDestroy {

  deviceId: number;
  public alertPanel: AlertPanel;
  urlParamSubscription: Subscription;
  private keepAliveTimerSubscription: Subscription;
  keepAliveTimerActive = false;
  deviceState: string;
  invokerInitSubscription: Subscription;
  isLoading: boolean;
  public breakpoint = 4;
  keepAliveTimerCounter: number;

  constructor(
    public rs: LangService,
    public activeRoute: ActivatedRoute,
    public route: Router,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public dialog: MatDialog,
    public deviceService: DeviceService,
    public invokerService: InvokerService,
    public commandService: CommandService,
    public overlay: Overlay,
    public ds: DialogService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    console.log("CommandsComponent.constructor()");
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 500) ? 1 :
      (event.target.innerWidth <= 700 ? 3 : 4);
  }

  ngOnInit() {
    console.log("CommandsComponent.ngOnInit()");

    //Url parameters
    this.breakpoint = (window.innerWidth <= 500) ? 1 :
      (window.innerWidth <= 700 ? 3 : 4);

    this.urlParamSubscription = this.activeRoute.params.subscribe(params => {

      this.deviceId = +params['id'];// (+) converts string 'id' to a number
      const userContractId = +params['userContractId'];

      //Initializing device service
      this.deviceService.list().subscribe((o) => {

        this.deviceService.setActiveDevice(this.deviceId, userContractId);

        //Initializing command service
        this.commandService.init(this.deviceService.activeDevice).subscribe(rsp => {
        }, err => {

          this.commandService.model.disableModule = true;
          if (err.type === "warning") {
            this.alertPanel = new AlertPanel(err.message, AlertType.Warning);
          }
          else {
            this.alertPanel = new AlertPanel(err.message, AlertType.Danger);
          }

        }//this.processService.showError(err)
        );

        this.keepAliveTimerCounter = 0;
        this.keepAliveTimerSubscription = this.deviceService.checkStatus_Timer()
          .subscribe(rsp => {

            if (this.keepAliveTimerCounter < 0) {
              this.keepAliveTimerCounter = 0;
            }
            this.keepAliveTimerCounter++;


            if (!this.keepAliveTimerActive
              && ((this.deviceState === "Connected" && (this.keepAliveTimerCounter % 5) === 0)
                || this.deviceState !== "Connected")) {
              this.keepAliveTimerActive = true;

              const keepAliveRequest = new KeepAliveRequestDTO();
              keepAliveRequest.CommandId = null;
              keepAliveRequest.DeviceId = this.deviceId;
              keepAliveRequest.UserContractId = this.deviceService.activeDevice.userContractId;
              keepAliveRequest.KeepAlive = true;


              this.deviceService.keepAlive(keepAliveRequest)
                .pipe(
                  finalize(() => this.keepAliveTimerActive = false)
                )
                .subscribe(kaRsp => {
                  const keepAliveResponse = kaRsp;

                  this.deviceState = keepAliveResponse.hasResponseFromDevice ? "Connected" : "Disconecting";

                  if (this.deviceState == "Connected") {
                    this.isLoading = false;
                    if (!this.invokerService.isInitialized) {
                      this.invokerInitSubscription = this.invokerService.init(keepAliveRequest.DeviceId, keepAliveRequest.UserContractId).subscribe();///Need unsuscribe to work
                    }
                  }

                }, (err) => {
                  console.log("Error keepalive, see the next line:")
                  console.log(err);
                  if (err.status != 200) {
                    this.deviceState = "Disconnecting";
                  }
                });
            }
          });



      }, err => { this.ds.show(err.message, "Error", DialogType.Error).subscribe(); });

      this.isLoading = true;

      //Keep Alive Subscription

    });
  }

  addCommand() {
    this.commandService.model.newCustomControlIfCancel = new CommandCustomControlModel();
    this.commandService.cleanAddNewCustomControl();
    if (this.commandService.model.commandConfiguration.maxCCC <= this.commandService.model.commandCustomControl.length) {
      this.snackBar.open(this.rs.Resource("WarnMaxItems"), "", { duration: 1500 });
    }
    else {
      this.route.navigate(['/devices/commands/add', this.commandService.model.device.id, this.commandService.model.device.userContractId], { relativeTo: this.activeRoute, skipLocationChange: true });
    }
  }

  deleteCommand(event: any, commandCustomControl: CommandCustomControlModel) {
    this.ds.confirm(this.rs.Resource("ConfirmRemove"), this.rs.Resource("LabelDelete"))
      .subscribe(rsp => {
        if (rsp == true) {
          this.commandService.DeleteCommand(commandCustomControl).subscribe(
            rs => {
            }
            , err => { this.ds.show(err.message, "Error", DialogType.Error).subscribe(); });
        }
      });
  }

  editCommand(event: any, commandCustomControl: CommandCustomControlModel) {

    this.commandService.editCommandCustomControl(commandCustomControl);

    this.route.navigate(['/devices/commands/add', this.commandService.model.device.id, this.commandService.model.device.userContractId], { relativeTo: this.activeRoute, skipLocationChange: true });
  }

  executeCommand(event, ccc: CommandCustomControlModel, commandOption: CommandOptionModel) {
    if (!ccc.isExecutingCommand) {

      ccc.isExecutingCommand = true;
      this.commandService.executeCommand(commandOption)
        .pipe(finalize(() => ccc.isExecutingCommand = false))
        .subscribe((rsp: any) => {
          if (rsp) {

            const responsesDatas = rsp as Array<InvokerMethodResponse>;
            ccc.responseLines = new Array<TerminalLine>();

            let isSuccess = true;
            let index = 0;
            for (const responseData of responsesDatas) {

              const action = commandOption.commandActions[index++];

              ccc.responseLines.push(new TerminalLine(`${index}.- ${action.commandMethod.name}`, AlertType.Info));

              if (responseData.methodResponseType === InvokerMethodResponseType.ArrayOfString) {
                for (const line in responseData.data) {
                  ccc.responseLines.push(new TerminalLine(`\t${responseData.data[line]}`, AlertType.Info));
                }
              }
              else if (responseData.methodResponseType === InvokerMethodResponseType.File) {
                this.invokerService.downloadFile(responseData.data);

              }
              else if (responseData.methodResponseType === InvokerMethodResponseType.String) {
                ccc.responseLines.push(new TerminalLine(`\t${responseData.data}`, AlertType.Info));

              }
              else if (responseData.methodResponseType === InvokerMethodResponseType.Exception) {
                const alert = responseData.data.InvokerExceptionType === 1 ? AlertType.Info
                  : responseData.data.InvokerExceptionType === 2 ? AlertType.Warning
                    : AlertType.Danger;

                isSuccess = false;
                ccc.responseLines.push(new TerminalLine(`\t${responseData.data.Message}`, alert));
              }
            }

            //TODO: Command Responses, Notify to user the result.
            const data = new CommandDetailResponseModel();
            data.lines = ccc.responseLines;

            const resultMessage = isSuccess ? this.rs.Resource("LabelSuccess") : this.rs.Resource("LabelError");

            if (isSuccess) {
              ccc.selectedOption = commandOption;//Don't keep selection with [value]="ccc.selectedOption"
            }

            this.snackBar.open(resultMessage + ": " + commandOption.name, this.rs.Resource("LabelDetail"),
              {
                duration: 3000,
                panelClass: (isSuccess ? ["snack-success"] : ["snack-error"])
              })
              .onAction()
              .subscribe(() => {

                const dialogRef = this.dialog.open(CommandResponseDetailDialogComponent, {
                  data: { model: data }
                  //scrollStrategy: this.overlay.scrollStrategies.noop()
                });

                dialogRef.afterClosed().subscribe(result => {

                  if (result == true) {
                    console.log(`Dialog result: ${result}`);
                  }
                });
              }
              );

          }
        }, err => { this.ds.show(err.message, "Error", DialogType.Error).subscribe(); }
        )
    }
  }


  ngOnDestroy() {

    console.log("ProcessComponent.ngOnDestroy()");
    this.urlParamSubscription.unsubscribe();
    if (this.keepAliveTimerSubscription)
      this.keepAliveTimerSubscription.unsubscribe();

    if (this.invokerInitSubscription)
      this.invokerInitSubscription.unsubscribe();

    if (this.deviceService.activeDevice) {
      const keepAliveRequest = new KeepAliveRequestDTO();
      keepAliveRequest.CommandId = null;
      keepAliveRequest.DeviceId = this.deviceId;
      keepAliveRequest.UserContractId = this.deviceService.activeDevice.userContractId;
      keepAliveRequest.KeepAlive = false;

      this.deviceService.keepAlive(keepAliveRequest).subscribe(() => {
        //There is not problem if it message is not received
      }, (err) => {
        if (err.status != 200) {
          console.log("DeviceService.keepAlive_Error" + err.message)
        }
      });
    }

  }
}
