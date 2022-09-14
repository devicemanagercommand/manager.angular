import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LangService } from '../../../services/shared/lang.service';
import { UserAuthConfiguration } from '../../../configuration/user.auth.configuration';
import { AlertPanel, AlertType } from '../../shared/alert.panel.component';
import { Subscription } from 'rxjs';
import { ProcessService, InternalCommandType, TerminalLine } from '../../../services/device/process.service';
import { DeviceService, KeepAliveRequestDTO } from '../../../services/device/device.service';
import { InvokerService, DTOInvokerInfo, InvokerMethodResponse, InvokerMethodResponseType } from "../../../services/device/invoker.service";
import { CommandHistoryService } from "../../../services/shared/command-history.service";
import { HelperService, TriggerHelper } from '../../../services/shared/helper.service';
import { NgScrollbar } from 'ngx-scrollbar';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ProcessOptionsComponent } from './process.options.component';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
  preserveWhitespaces: true,
  animations: [
    TriggerHelper.sendToLeft('routeAnimation'),
  ]
})

export class ProcessComponent implements OnInit, OnDestroy, AfterViewChecked {
  processServiceSubcription: Subscription;
  throwScrollToBottom: boolean;
  keepAliveTimerActive: boolean;//To prevent double call
  public deviceState: string;
  urlParamSubscription: Subscription;//To destroy 
  public alertPanel: AlertPanel;
  @ViewChild('terminal') private terminal: ElementRef;
  @ViewChild('command') private command: ElementRef;
  public isLoading = false;
  @ViewChild(NgScrollbar) scrollRef: NgScrollbar
  @ViewChild("code") private codeRef: ElementRef<HTMLElement>;


  private keepAliveTimerSubscription: Subscription;
  private invokerInitSubscription: Subscription;
  keepAliveTimerCounter: number;

  constructor(
    public processService: ProcessService,
    public rs: LangService,
    private router: Router,
    private authConfig: UserAuthConfiguration,
    public formBuilder: UntypedFormBuilder,
    public route: ActivatedRoute,
    public deviceService: DeviceService,
    public invokerService: InvokerService,
    public location: Location,
    public commandHistoryService: CommandHistoryService,
    public renderer: Renderer2,
    public helper: HelperService,
    public dialog: MatDialog,
  ) {
    console.log("ProcessComponent.constructor()");
    //this.processService.activeDevice.processModel.terminalLines = new Array<TerminalLine>();
    this.throwScrollToBottom = true;
  }

  scrollToBottom() {
    this.throwScrollToBottom = true;
    if (this.terminal) {
      const options: ScrollToOptions = {
        top: this.scrollRef.nativeElement.firstElementChild.firstElementChild.firstElementChild.scrollHeight
      };

      this.scrollRef.scrollTo(options);
    }

    if (!this.processService && !this.processService.processCommand)
      this.processService.processCommand.command = ""

    if (this.command) {
      setTimeout(() => {
        this.command.nativeElement.focus();
      }, 0);
    }

  }

  ngAfterViewChecked() {
    if (this.throwScrollToBottom) {
      this.scrollToBottom();
      this.throwScrollToBottom = false;
    }
  }

  ngOnInit() {
    this.processService.isActive = true;
    this.isLoading = true;
    console.log("ProcessComponent.ngOnInit");
    //Loading process configurations

    this.processService.Any_Error.subscribe(o => {
      this.processService.showError(o);
      this.scrollToBottom();
    })

    this.invokerService.Any_Error.subscribe(o => {
      this.processService.showError(o);
      this.scrollToBottom();
    })

    this.processService.Command_End.subscribe(o => {
      this.scrollToBottom();
      this.command.nativeElement.focus();
    });

    this.commandHistoryService.Any_Error.subscribe(o => {
      this.processService.showError(o);
      this.scrollToBottom();
    });

    this.rs.init().subscribe(() => {
      //Adding white line for css and help

      this.urlParamSubscription = this.route.params.subscribe(params => {
        const deviceId = +params['id'];
        const userContractId = +params['userContractId'];
        this.deviceService.list().subscribe((o) => {

          this.deviceService.setActiveDevice(deviceId, userContractId);
          this.processService.activeDevice = this.deviceService.activeDevice;

          if (this.deviceService.activeDevice.processModel.terminalLines.length === 0) {
            this.showHelp();
          }


          this.keepAliveTimerCounter = 0;
          this.keepAliveTimerSubscription = this.deviceService.checkStatus_Timer()
            .subscribe(rsp => {
              if (this.keepAliveTimerCounter < 0) {
                this.keepAliveTimerCounter = 0;
              }
              this.keepAliveTimerCounter++;

              if (!this.keepAliveTimerActive
                && this.processService.processCommand
                && ((this.deviceState === "Connected" && (this.keepAliveTimerCounter % 5) === 0)
                  || this.deviceState !== "Connected")) {

                this.keepAliveTimerActive = true;

                if (this.processService
                  && this.processService.processCommand
                  && this.processService.processCommand.deviceId) {

                  const keepAliveRequest = new KeepAliveRequestDTO();
                  keepAliveRequest.CommandId = null;
                  keepAliveRequest.DeviceId = this.processService.processCommand.deviceId;
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
                          this.invokerInitSubscription = this.invokerService.init(keepAliveRequest.DeviceId, keepAliveRequest.UserContractId).subscribe(
                            rsp => { }
                            , err => {
                              if ("warning" == err.type) {
                                this.processService.AddLine(new TerminalLine(err.message, AlertType.Warning));
                              }
                              else {
                                this.processService.AddLine(new TerminalLine(err.message, AlertType.Danger));
                              }
                            }
                          );///Need unsuscribe to work
                        }
                      }

                    }, (err) => {
                      console.error("Error keepalive, see the next line:")
                      console.error(err);
                      if (err.status != 200) {
                        this.processService.showError(err);
                        this.scrollToBottom();
                        this.deviceState = "Disconnecting";
                      }
                    });
                }
                else {
                  this.keepAliveTimerActive = false;
                }
              }
            });

          this.processService.init(deviceId, userContractId).subscribe(
            o => {
              ///activeDevice keep the data in memory in DeviceService
            }
          );


        });


      });

    });
    ////Url parameters
  }

  showHelp() {
    console.log("ProcessCompoenent.showHelp() ... ");
    const infoHelpsLines = this.rs.Resource("InfoProcessHelp");
    if (infoHelpsLines) {
      const infoHelpsLinesArray = infoHelpsLines.split(/\\n/);

      for (let infoLine of infoHelpsLinesArray) {
        infoLine = infoLine.replace(/\\t/g, "    ");
        this.processService.AddLine(new TerminalLine(infoLine, AlertType.Info));
      }

      this.processService.AddLine(new TerminalLine("", AlertType.Default));
      this.scrollToBottom();
    }
  }

  showHistory() {
    this.processService.AddLine(new TerminalLine("", AlertType.Info));
    this.processService.AddLine(new TerminalLine(this.rs.Resource('LabelProcessHistory'), AlertType.Info));
    let counter = 1;
    for (const historyCommand of
      this.commandHistoryService.getHistoryCommandOfProcess(this.processService.processOptions.selectedProcess.id)) {

      const status = historyCommand.isSuccess ? 'S' : 'F';
      this.processService.AddLine(new TerminalLine(`${counter++} - ${status} - ${historyCommand.command}`, AlertType.Info));
    }
    this.processService.AddLine(new TerminalLine("", AlertType.Info));
    this.scrollToBottom();
  }

  back() {
    this.location.back();
  }

  ///Send command
  submit() {
    console.log("ProcessComponent.submit() ... command ... ");
    if (this.processService.processCommand.command == "") {
      return;
    }

    if (!this.processService.isInternalCommand()) {
      this.processServiceSubcription = this.processService.command()///Send command (Service Has The Model)
        .pipe(finalize(() => {
          this.processService.commandEnabled = true;
          this.scrollToBottom();
        }))
        .subscribe(() => {

        }, err => {
          this.processService.showError(err);
        });
    }
    else { //Process Internal Commands

      if (this.processService.isInternalCommandType(InternalCommandType.Help)) {
        this.showHelp();

      }
      else if (this.processService.isInternalCommandType(InternalCommandType.Clear)) {
        this.processService.RemoveLines();
        this.processService.processCommand.command = ""
        this.command.nativeElement.focus();
      }
      else if (this.processService.isInternalCommandType(InternalCommandType.History)) {
        this.showHistory();
        this.processService.processCommand.command = ""
        this.command.nativeElement.focus();
      }
      else if (this.processService.isInternalCommandType(InternalCommandType.Exit)) {
        this.router.navigate(["/"]);
      }
      else if (this.processService.isInternalCommandType(InternalCommandType.InvokerList)) {
        this.invokerService.list(this.processService.processCommand.deviceId, this.processService.processCommand.userContractId)
          .subscribe(rsp => {
            if (rsp) {
              let data = rsp as DTOInvokerInfo[];

              data = data.filter(o => o.os.split(",").find(b => b == this.deviceService.activeDevice.osId.toString()));

              this.processService.AddLine(new TerminalLine(`${this.processService.processCommand.currentDirectory}>${this.processService.processCommand.command}`, AlertType.Info));

              const command = this.processService.processCommand.command;
              const commandSplited = command.split(/[ ]+/);
              const invokerAlias = commandSplited[1];

              if (commandSplited.length == 1) {
                ///Infokers List Invokers
                if (!data || data.length == 0) {
                  this.processService.AddLine(new TerminalLine(this.rs.Resource("WarnNoCommands"), AlertType.Warning))
                }
                else {
                  for (const invoker of data) {

                    let invokerAliasPadding = 30 - invoker.alias.length;
                    let invokerCommandHelp = ` - ${invoker.alias}${" ".repeat(invokerAliasPadding)}"${invoker.help}"`
                    this.processService.AddLine(new TerminalLine(invokerCommandHelp, AlertType.Default))

                  }
                }
              } else {

                ///Infoker List 
                for (let invoker of data) {
                  if (invoker.alias != invokerAlias) {
                    continue;
                  }

                  let invokerAliasPadding = 30 - invoker.alias.length;
                  let invokerCommandHelp = `${invoker.alias}${" ".repeat(invokerAliasPadding)}"${invoker.help}"`
                  this.processService.AddLine(new TerminalLine(invokerCommandHelp, AlertType.Default))
                  this.processService.AddLine(new TerminalLine("", AlertType.Info))

                  ///Method invokers
                  for (let method of invoker.methods) {

                    let leftPadding = 9;
                    let methodAliasPadding = 40 - (method.alias.length + leftPadding + method.name.length);
                    let methodCommandHelp = `${" ".repeat(leftPadding)} - ${method.name.toLowerCase()}${" ".repeat(methodAliasPadding)}"${method.help}"`

                    this.processService.AddLine(new TerminalLine(`${methodCommandHelp}`, AlertType.Default))

                    var parametersConcatenated = "";
                    for (let parameter of method.parameterInfoes) {
                      if (parameter.type.name === "object") {
                        for (let propertyOfParameter of parameter.propertiesInfoes) {
                          parametersConcatenated += " [" + propertyOfParameter.name.toLowerCase() + "|" + propertyOfParameter.alias.toLowerCase() + "]=<" + this.prettyName(propertyOfParameter.type.name) + ">";
                        }
                      }
                    }
                    this.processService.AddLine(new TerminalLine("", AlertType.Default))
                    this.processService.AddLine(
                      new TerminalLine(`\t\t\t:${invoker.alias} ${method.alias.toLowerCase()}${parametersConcatenated}`, AlertType.Default))
                    this.processService.AddLine(new TerminalLine("", AlertType.Default))
                  }
                }
              }

              this.processService.AddLine(new TerminalLine("", AlertType.Info))//Empty line

              this.scrollToBottom();
              this.processService.processCommand.command = ""
              this.command.nativeElement.focus();
            }
          }, err => this.processService.showError(err));
      }
      else if (this.processService.isInternalCommandType(InternalCommandType.InvokerInvoke)) {

        this.processService.commandEnabled = false;
        this.invokerService.invokeCommand(this.processService.processCommand.command, this.processService.processCommand.deviceId, this.processService.processCommand.userContractId)
          .pipe(finalize(() => {
            this.processService.commandEnabled = true;
            this.scrollToBottom();
          }))
          .subscribe(rsp => {
            if (rsp) {
              const responseData = rsp as InvokerMethodResponse

              this.commandHistoryService.saveToMemory(
                this.processService.processCommand.command,
                this.processService.processOptions.selectedProcess.id
                , this.processService.processCommand.deviceId
                , this.processService.processCommand.userContractId
                , true
              );


              if (responseData.methodResponseType == InvokerMethodResponseType.ArrayOfString) {
                for (let line in responseData.data) {
                  this.processService.AddLine(
                    new TerminalLine(responseData.data[line], AlertType.Info))
                }
                this.processService.AddLine(new TerminalLine("", AlertType.Info))//Empty line
              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.File) {
                this.invokerService.downloadFile(responseData.data);
              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.String) {
                this.processService.AddLine(
                  new TerminalLine(responseData.data, AlertType.Info))
                this.processService.AddLine(new TerminalLine("", AlertType.Info))//Empty line
              }
              else if (responseData.methodResponseType == InvokerMethodResponseType.Exception) {
                const alert =
                  responseData.data.InvokerExceptionType == 1 ? AlertType.Info
                    : responseData.data.InvokerExceptionType == 2 ? AlertType.Warning : AlertType.Danger;

                this.processService.AddLine(
                  new TerminalLine(responseData.data.Message, alert)
                );
                this.processService.AddLine(new TerminalLine("", AlertType.Info))//Empty line
              }
              this.scrollToBottom();
              this.processService.processCommand.command = ""
              this.command.nativeElement.focus();
            }
          },
            err => this.processService.showError(err));
      }
    }
  }

  prettyName(typeName: string): string {
    if (typeName.toLowerCase().includes("number")
    ) {
      return this.rs.Resource("LabelEntero");
    }
    else if (typeName.toLowerCase().includes("string")) {
      return this.rs.Resource("LabelString");
    }
    else if (typeName.toLowerCase().includes("boolean")) {
      return this.rs.Resource("LabelBoolean");
    }

  }


  command_keypress(event: KeyboardEvent) {
    if (event.keyCode == 13) {//Enter
      event.preventDefault();
      this.submit();
    } else if (event.keyCode == 38) {///Key Up
      this.processService.processCommand.command = this.commandHistoryService.backStoryCommand();
      this.helper.cursorToFinal(this.command.nativeElement);

    } else if (event.keyCode == 40) {///Key Down
      this.processService.processCommand.command = this.commandHistoryService.nextStoryCommand();
      this.helper.cursorToFinal(this.command.nativeElement);


    } else if (event.keyCode == 9 || (event.keyCode == 9 && event.shiftKey)) {
      event.preventDefault();
      this.processService.autocompleteCommand(event);
      this.processService.autocompleteResponse.isTabLastKey = true;//Tab
      return false;
    } else if (!event.shiftKey) {
      this.processService.autocompleteResponse.isTabLastKey = false;//Tap
    }
  }

  @HostListener('window:keydown', ['$event'])
  hotKey_Event(event: KeyboardEvent) {
    if (this.processService.isActive) {
      if (event.keyCode == 67 && event.altKey) {//alt + c
        this.command.nativeElement.focus();
      }
    }

  }

  openConfigurationWindow() {
    const dialogRef = this.dialog.open(ProcessOptionsComponent, {
      data: { deviceService: this.deviceService }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { }
    });
  }

  ngOnDestroy() {
    console.log("ProcessComponent.ngOnDestroy()");
    this.urlParamSubscription.unsubscribe();
    if (this.keepAliveTimerSubscription)
      this.keepAliveTimerSubscription.unsubscribe();

    if (this.invokerInitSubscription)
      this.invokerInitSubscription.unsubscribe();

    if (this.processServiceSubcription) {
      this.processServiceSubcription.unsubscribe();
    }

    if (this.deviceService.activeDevice) {
      const keepAliveRequest = new KeepAliveRequestDTO();
      keepAliveRequest.CommandId = null;
      keepAliveRequest.DeviceId = this.processService.processCommand.deviceId;
      keepAliveRequest.UserContractId = this.deviceService.activeDevice.userContractId;
      keepAliveRequest.KeepAlive = false;

      this.deviceService.keepAlive(keepAliveRequest).subscribe(() => {
        //There is not problem if it message is not received
        console.log("Destroy keepAlive Success")
      }, (err) => {
        console.log("Destroy keepAlive Error", err.message)
      });
    }

    this.processService.isActive = false;
    this.commandHistoryService.saveToServer
      (
        this.processService.processCommand.deviceId,
        this.processService.processCommand.userContractId
      );
  }
}


