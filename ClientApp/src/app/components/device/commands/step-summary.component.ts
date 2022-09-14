import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoService } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, NgForm } from '@angular/forms';
import { CommandControlModel } from '../../../models/device/commands/command-control.model';
import { CommandService } from '../../../services/device/command.service';
import { DialogType, DialogService } from '../../shared/dialog.component';
import { finalize } from 'rxjs/operators';
import { CommandCustomControlModel } from 'src/app/models/device/commands/command-custom-control.model';
import { CommandOptionModel } from 'src/app/models/device/commands/command-option.model';
import { InvokerMethodResponse, InvokerMethodResponseType, InvokerService } from 'src/app/services/device/invoker.service';
import { TerminalLine } from 'src/app/services/device/process.service';
import { CommandDetailResponseModel } from 'src/app/models/device/commands/command-detail-response-model';
import { CommandResponseDetailDialogComponent } from './commands-response-detail-dialog.component';


@Component({
  selector: 'step-summary',
  templateUrl: './step-summary.component.html',
  styleUrls: ['./step-summary.component.scss'],
})
export class StepSummaryComponent {
  deviceId: number;
  public alert: AlertPanel;
  urlParamSubscription: Subscription;
  isLoading = false;

  isLinear = false;
  @ViewChild('summaryStepForm') public summaryStepForm: NgForm = new NgForm(null, null);

  test: string;

  get ccc() { return this.commandService.model.newCustomControl; }

  constructor(
    public rs: LangService,
    public activateRoute: ActivatedRoute,
    public route: Router,
    public deviceInfoService: DeviceInfoService,
    public messageService: MessageService,
    public logger: LoggerService,
    private _formBuilder: UntypedFormBuilder,
    public commandService: CommandService,
    public ds: DialogService,
    public dialog: MatDialog,
    public invokerService: InvokerService,
    public snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    setTimeout(() => {

    }, 1);
  }

  commandControlChange(event: MatRadioChange) {
    let cc: CommandControlModel = event.value;

    this.commandService.loadCommandControl(cc);
  }

  addNewCustomCommand() {

    if (this.isLoading == false) {

      this.isLoading = true;

      this.commandService.addNewCustomCommand()
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(rsp => {

          this.route.navigate(['/devices/commands', this.commandService.model.device.id, this.commandService.model.device.userContractId]);

        }, err => { this.ds.show(err.message, "Error", DialogType.Error).subscribe(); }
        );

    }
  }

  esm = {
    isErrorState: () => { return true }
  }

  executeCommand(event, ccc: CommandCustomControlModel, commandOption: CommandOptionModel) {
    if (!ccc.isExecutingCommand) {

      ccc.isExecutingCommand = true;

      this.commandService.executeCommand(commandOption)
        .pipe(finalize(() => ccc.isExecutingCommand = false))
        .subscribe((rsp: any) => {
          if (rsp) {

            var responsesDatas = rsp as Array<InvokerMethodResponse>;
            ccc.responseLines = new Array<TerminalLine>();

            let isSuccess = true;
            let index = 0;
            for (let responseData of responsesDatas) {

              var action = commandOption.commandActions[index++];

              ccc.responseLines.push(new TerminalLine(`${index}.- ${action.commandMethod.name}`, AlertType.Info));

              if (responseData.methodResponseType == InvokerMethodResponseType.ArrayOfString) {
                for (let line in responseData.data) {
                  ccc.responseLines.push(new TerminalLine(`${responseData.data[line]}`, AlertType.Info));
                }
                ccc.responseLines.push(new TerminalLine("", AlertType.Info));

              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.File) {
                this.invokerService.downloadFile(responseData.data);

              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.String) {
                ccc.responseLines.push(new TerminalLine(responseData.data, AlertType.Info));
                ccc.responseLines.push(new TerminalLine("", AlertType.Info));

              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.Exception) {
                var alert =
                  responseData.data.InvokerExceptionType == 1 ? AlertType.Info
                    : responseData.data.InvokerExceptionType == 2 ? AlertType.Warning : AlertType.Danger;

                isSuccess = false;
                ccc.responseLines.push(new TerminalLine(responseData.data.Message, alert));
                ccc.responseLines.push(new TerminalLine("", AlertType.Info));
              }
            }

            //TODO: Command Responses, Notify to user the result.
            let data = new CommandDetailResponseModel();
            data.lines = ccc.responseLines;

            let resultMessage = isSuccess ? this.rs.Resource("LabelSuccess") : this.rs.Resource("LabelError");

            this.snackBar.open(resultMessage + ": " + commandOption.name, this.rs.Resource("LabelDetail"),
              {
                duration: 3000,
                panelClass: (isSuccess ? ["snack-success"] : ["snack-error"])
              })
              .onAction()
              .subscribe(() => {

                let dialogRef = this.dialog.open(CommandResponseDetailDialogComponent, {
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

}
  //ngOnInit() {
  //  //Url parameters
  //  this.urlParamSubscription = this.route.params.subscribe(params => {
  //    this.deviceId = +params['id'];// (+) converts string 'id' to a number
  //  });
  //}

  //ngOnDestroy() {
  //  this.urlParamSubscription.unsubscribe();
  //}
