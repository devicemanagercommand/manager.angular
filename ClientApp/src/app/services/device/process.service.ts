import { Injectable, EventEmitter } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { AlertType } from "../../components/shared/alert.panel.component";
import { ResultMessageDTO } from "../shared/message.service";
import { ComponentPipeService, PipeMessage } from "../shared/component.pipe.service";
import { CommandHistoryService, StoryCommandDTO } from "../shared/command-history.service";
import { DeviceModel } from 'src/app/models/device/device.model';
import { map } from 'rxjs/operators';
import { UserAuthService } from '../user/user.auth.service';


@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  public activeDevice: DeviceModel;
  commandEnabled = true;
  public processOptions: ProcessOptionsModel = new ProcessOptionsModel;
  public processModel_Loaded: EventEmitter<ProcessOptionsModel> = new EventEmitter<ProcessOptionsModel>();
  public Any_Error: EventEmitter<any> = new EventEmitter<any>();
  public Command_End: EventEmitter<any> = new EventEmitter<any>();
  public isActive: boolean = true;

  public processCommand: ProcessCommandDTO;
  //public terminalLines: Array<TerminalLine>;

  public autocompleteResponse: AutocompleteResponseDTO = new AutocompleteResponseDTO();

  constructor(
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService,
    private cookieService: CookieService,
    private pipeMessageCompoenent: ComponentPipeService,
    public historyCommandService: CommandHistoryService,
    public userAuth: UserAuthService
  ) {
    console.log("ProcessService.constructor");
  }

  init(deviceId: number, userContractId: number) {
    console.log("ProcessService.init()");
    this.processCommand = new ProcessCommandDTO();

    if (!this.userAuth.isDesign()) {
      this.historyCommandService.init(deviceId, userContractId);
    }

    const maxLines = this.cookieService.get("processOptions.maxLines");
    this.processOptions.maxLines = maxLines ? +maxLines : 10000;

    return this.loadProcessOptions(deviceId, userContractId);
    //this.loadCommand(deviceId); Changed to loadProcessOptions
  }

  isProcessChanging() {
    ///new RegExp("^[ ]*#[a-z]*$", "gi").test(this.processCommand.command);

    this.processOptions.processes
    return
  }

  isInternalCommand() {
    return new RegExp("^[ ]*(#|:)[0-9 =a-z]*$", "gi").test(this.processCommand.command)
      || new RegExp("^[ ]*exit$", "gi").test(this.processCommand.command);
  }

  isInternalCommandType(internalTypeCommand: InternalCommandType) {
    if (internalTypeCommand == InternalCommandType.Clear) {
      return new RegExp("^[ ]*#(clear|cls|cs)*$", "gi").test(this.processCommand.command);
    }
    else if (internalTypeCommand == InternalCommandType.Help) {
      return new RegExp("^[ ]*#(help|h)*$", "gi").test(this.processCommand.command);
    }
    else if (internalTypeCommand == InternalCommandType.History) {
      return new RegExp("^[ ]*#(s|history)*$", "gi").test(this.processCommand.command);
    }
    else if (internalTypeCommand == InternalCommandType.InvokerList) {
      return new RegExp("^[ ]*#(c|commands)[ ]*.*$", "gi").test(this.processCommand.command);
    }
    else if (internalTypeCommand == InternalCommandType.InvokerInvoke) {
      return new RegExp("^[ ]*:\w*[ ]*\.*$", "gi").test(this.processCommand.command);
    }
    else if (internalTypeCommand == InternalCommandType.Exit) {
      return new RegExp("^[ ]*exit$", "gi").test(this.processCommand.command);
    }
  }

  loadProcessOptions(deviceId: number, userContractId: number) {
    const processResponseString = localStorage.getItem("processService.processOptions");
    let lastProcessOptionFromLocalStore: ProcessOptionsModel = null;
    this.processOptions.deviceId = deviceId;
    this.processOptions.userContractId = userContractId;

    if (processResponseString) {
      const processResponsesAny = JSON.parse(processResponseString);
      const processResponses = processResponsesAny as ProcessOptionsModel[]
      lastProcessOptionFromLocalStore = processResponses.find(o => o.deviceId == deviceId
        && o.userContractId == userContractId);

      if (lastProcessOptionFromLocalStore) {
        this.processOptions.processes = lastProcessOptionFromLocalStore.processes;
        this.processOptions.processImplemenentations = lastProcessOptionFromLocalStore.processImplemenentations;
        this.processOptions.selectedProcessImplementation = lastProcessOptionFromLocalStore.processImplemenentations
          .find(o =>
            o.implementationTypeName == lastProcessOptionFromLocalStore.selectedProcessImplementation.implementationTypeName);

        this.processOptions.selectedProcess = this.processOptions.processes.find(o => o.id == lastProcessOptionFromLocalStore.selectedProcess.id);
        this.processOptions.device = lastProcessOptionFromLocalStore.device;
        this.processOptions.isWrappedLines = lastProcessOptionFromLocalStore.isWrappedLines;
        this.processModel_Loaded.emit(this.processOptions);
      }
      this.loadCommand(deviceId, userContractId);
    }

    //TODO: Check changes with MD5 HASH
    if (!lastProcessOptionFromLocalStore) {

      return this.httpAuth.get<ProcessOptionsModel>(`api/device/process/getProcessModel/${deviceId}/${userContractId}`).pipe(map(o => {
        const resp = o;
        //this.processOptions = resp;
        this.processOptions.processes = resp.processes;
        this.processOptions.selectedProcess = resp.processes[0];
        this.processOptions.selectedProcessImplementation = resp.processImplemenentations[0];
        this.processOptions.processImplemenentations = resp.processImplemenentations;
        this.processOptions.device = resp.device;
        this.processModel_Loaded.emit(this.processOptions);
        this.loadCommand(deviceId, userContractId);
        return this.processOptions;
      },
        err => this.Any_Error.emit(err)
      ));
    } else {
      return Observable.create(observer => { observer.next(this.processOptions) });
    }

  }

  //Execute the command to device through web api 
  command(): Observable<ProcessResponseDTO> {
    if (this.processCommand
      && this.processCommand.command
      && this.processCommand.command.trim() != "") {
      console.log("ProcessService.command");

      const processChaged = this.processOptions.processes.find(o => this.processCommand.command.match(new RegExp(o.searchRegularExpression)) != null);
      if (processChaged) {
        this.processOptions.selectedProcess = processChaged;

        ///Saving Command in LocalStorage.
        this.saveCommand(this.processCommand);
        this.saveProcessOptions();

        ///Cleaning
        this.processCommand.command = "";
      }
      else {
        this.processCommand.shellTypeSelected = this.processOptions.selectedProcessImplementation.implementationType;
        this.processCommand.processSelected = this.processOptions.selectedProcess.fileName;
        this.processCommand.isProcessFileChanged = this.processCommand.processSelected != this.processCommand.lastProcessSended;

        if (this.processCommand && this.processCommand.currentDirectory) {
          this.processCommand.currentDirectory = this.processCommand.currentDirectory.trim();
        }

        const body = JSON.stringify(this.processCommand);
        console.log(body);

        this.commandEnabled = false;
        return this.httpAuth.post<ProcessResponseDTO>("/api/device/process/command", body).pipe(map(rsp => {
          const processResponse = rsp;

          this.processCommand.currentDirectory = processResponse.currentDirectory;
          this.processCommand.currentDirectoryDirectories = processResponse.currentDirectoryDirectories;
          this.processCommand.lastProcessSended = this.processCommand.processSelected;

          ///Save the story command in array
          this.historyCommandService.saveToMemory(
            this.processCommand.command
            , this.processOptions.selectedProcess.id
            , this.processCommand.deviceId
            , this.processCommand.userContractId
            , processResponse.errorOutputLines == null || processResponse.errorOutputLines.length <= 1
          );


          ///Saving Command in LocalStorage.
          this.saveCommand(this.processCommand);
          this.saveProcessOptions();


          //if (this.processCommand.currentDirectory == null || this.processCommand.currentDirectory == 'undefined') {
          //  this.processCommand.currentDirectory = '';
          //}

          let terminalLine = new TerminalLine(`${this.processCommand.currentDirectory}>${this.processCommand.command}`, AlertType.Info);
          this.AddLine(terminalLine);

          ///Cleaning
          this.processCommand.commandId = processResponse.id || processResponse.id == "" ? 0 : +processResponse.id;
          this.processCommand.command = "";

          if (this.activeDevice.processModel.terminalLines.length >= this.processOptions.maxLines) {
            let startIndex = this.activeDevice.processModel.terminalLines.length - this.processOptions.maxLines;
            this.activeDevice.processModel.terminalLines = this.activeDevice.processModel.terminalLines.slice(startIndex);
          }

          if (processResponse.output != null) {
            for (let outputLines of processResponse.output) {
              this.AddLine(new TerminalLine(outputLines, AlertType.Success))
            }
          }

          if (processResponse.errorOutputLines != null) {
            for (let errorLines of processResponse.errorOutputLines) {
              this.AddLine(new TerminalLine(errorLines, AlertType.Danger))
            }
          }

          this.Command_End.emit();

          return rsp;
        }));
      }
    }
  }

  AddLine(terminalLine: TerminalLine) {
    this.activeDevice.processModel.terminalLines.push(terminalLine);
  }

  RemoveLines() {
    this.activeDevice.processModel.terminalLines = this.activeDevice.processModel.terminalLines.slice(1, 1);
  }

  showError(err: any) {
    console.log(err);

    this.processCommand.command = "";

    if (err.status == 500 && err.error) {
      const errorMessage = err.error as ResultMessageDTO;
      this.AddLine(new TerminalLine(errorMessage.message, AlertType.Danger));
      this.AddLine(new TerminalLine("", AlertType.Danger));
    }
    else if (err.status == 500) {
      const errorMessage = err as ResultMessageDTO;
      this.AddLine(new TerminalLine(errorMessage.message, AlertType.Danger));
      this.AddLine(new TerminalLine("", AlertType.Danger));
    }
    else if (typeof err === "string") {
      this.AddLine(new TerminalLine(err, AlertType.Danger));
      this.AddLine(new TerminalLine("", AlertType.Danger));
    }
  }

  autocompleteCommand(e: KeyboardEvent) {
    console.log("ProcessService.autocompleteCommand");

    if (new RegExp("^[ ]*(cd)[ ]*.*", "gi").test(this.processCommand.command)) {

      //Search if the autocomplete command is in memory
      if (this.autocompleteResponse
        && this.autocompleteResponse.data.length > 0
        && this.autocompleteResponse.isTabLastKey
      ) {
        this.putNextAutocompleteInCommandInput(this.autocompleteResponse, e);
      }
      else {
        if (this.processCommand.currentDirectory) {
          this.processCommand.currentDirectory =
            this.processCommand.currentDirectory.trim();
        }

        const autocompleteCommand = new AutocompleteCommandDTO
          (this.processCommand.deviceId,
            this.processCommand.userContractId,
            this.processCommand.command,
            this.processCommand.currentDirectory,
            this.processCommand.processSelected,
            null);

        const body = JSON.stringify(autocompleteCommand);
        console.log(body);
        this.httpAuth.post<AutocompleteResponseDTO>("/api/device/process/autocomplete", body)
          .subscribe(rsp => {
            if (rsp != null) {
              const data = rsp;
              this.autocompleteResponse.data = data.data;
              this.autocompleteResponse.nextAutocomplete = 0;
              this.autocompleteResponse.lastCommand = this.processCommand.command;
              this.putNextAutocompleteInCommandInput(this.autocompleteResponse, e);
            }
          }, err => this.Any_Error.emit(err)
          );
      }
    }
  }

  putNextAutocompleteInCommandInput(autocompleteResponse: AutocompleteResponseDTO, e) {
    if (e.shiftKey) {
      autocompleteResponse.nextAutocomplete--;//Try With Next 
    }
    else {
      autocompleteResponse.nextAutocomplete++;//Try With Next 
    }

    if (autocompleteResponse.nextAutocomplete >= autocompleteResponse.data.length) {
      autocompleteResponse.nextAutocomplete = 0;
    }

    if (autocompleteResponse.nextAutocomplete <= -1) {
      autocompleteResponse.nextAutocomplete = autocompleteResponse.data.length - 1;
    }
    const nextAutocomplete = autocompleteResponse.data[autocompleteResponse.nextAutocomplete];

    if (nextAutocomplete !== undefined && nextAutocomplete != "") {
      this.processCommand.command = nextAutocomplete;
    }
    else {
      this.processCommand.commandStateClass = "command-error";
      //commandInput.addClass('error-command-input');
      //setTimeout(() => commandInput.removeClass('error-command-input'), 200);
    }
    //commandInput.prop("selectionEnd", cursorIndex);
  }

  loadCommand(deviceId: number, userContractId: number) {
    this.processCommand.deviceId = deviceId;
    this.processCommand.userContractId = userContractId;

    const processResponseString = localStorage.getItem("processService.processCommand");
    let lastProcessCommand = null;
    if (processResponseString) {
      const processResponsesAny = JSON.parse(processResponseString);
      const processResponses = processResponsesAny as ProcessCommandDTO[]
      lastProcessCommand = processResponses.find(o => o.deviceId == deviceId && o.userContractId == userContractId);
    }

    if (lastProcessCommand) {
      this.processCommand = lastProcessCommand;
      this.processCommand.command = "";
    }

  }

  saveCommand(processCommand: ProcessCommandDTO) {
    ///Saving processResponse to restore last directory or any data
    ///to reload data after page refreshing
    const processResponseString = localStorage.getItem("processService.processCommand");
    if (processResponseString) {
      const processResponsesAny = JSON.parse(processResponseString);
      let processResponses = processResponsesAny as ProcessCommandDTO[];

      if (processResponses) {
        //Removing current device response.
        processResponses = processResponses.filter(o => o.deviceId != processCommand.deviceId);
        processResponses.push(processCommand);
        localStorage.setItem("processService.processCommand", JSON.stringify(processResponses));
      }
    }
    else {
      const processResponses = new Array<ProcessCommandDTO>();
      processResponses.push(processCommand);
      localStorage.setItem("processService.processCommand", JSON.stringify(processResponses));
    }
  }

  saveProcessOptions() {
    ///Saving processResponse to restore last directory or any data
    ///to reload data after page refreshing
    const processOptionsString = localStorage.getItem("processService.processOptions");
    if (processOptionsString) {
      const processResponsesAny = JSON.parse(processOptionsString);
      let processResponses = processResponsesAny as ProcessOptionsModel[];

      if (processResponses) {
        //Removing current device response.
        processResponses = processResponses.filter(o => o.deviceId != this.processCommand.deviceId && o.userContractId != this.processCommand.userContractId);
        processResponses.push(this.processOptions);
        localStorage.setItem("processService.processOptions", JSON.stringify(processResponses));
      }
    }
    else {
      const processResponses = new Array<ProcessOptionsModel>();
      processResponses.push(this.processOptions);
      localStorage.setItem("processService.processOptions", JSON.stringify(processResponses));
    }

    if (this.processOptions.maxLines && this.processOptions.maxLines > 100) {
      this.cookieService.set("processOptions.maxLines", this.processOptions.maxLines + "");
    }
  }

}

export class ProcessCommandDTO {
  public deviceId: number;
  public processTypes: ProcessImplementationDTO[];
  public command: string;
  public currentDirectory: string;
  public commandStateClass: string;
  public commandToCursor: string;
  public shellTypeSelected: string;
  public processSelected: string;
  public lastProcessSended: string;
  public commandId: number;
  public isProcessFileChanged: boolean;
  public currentDirectoryDirectories: string[];
  userContractId: number;
}
export class TerminalLine {

  private _typeClass: string;

  get typeClass(): string {
    switch (this.type) {
      case AlertType.Danger:
        return "danger";
      case AlertType.Default:
        return "default";
      case AlertType.Warning:
        return "warning";
      case AlertType.Info:
        return "info";
      case AlertType.Success:
        return "success";
      default:
        return "default";
    }
  }

  set typeClass(clss: string) {
    this._typeClass = clss;
  }

  public css: string;

  constructor(
    public line: string,
    public type: AlertType,
  ) {

    this._typeClass = "default";
  }
}


export class ProcessDTO {
  public fileName: string;
  public id: number;
  public searchRegularExpression: string;

}

export class ProcessImplementationDTO {
  public id: string;
  public implementationType: string;
  public isSelected: boolean;
  public implementationTypeDescription: string;
  public implementationTypeName: string;
  //public processConfigurations: ProcessConfigurationDTO[];
}

export class ProcessConfigurationDTO {
  public id: string;
  public arguments: string;
  public fileName: string;
  public isSelected: boolean;
}

export class ProcessResponseDTO {
  public output: string[];
  public currentDirectory: string;
  public currentDirectoryDirectories: string[];
  public errorOutputLines: string[];
  public id: string;
  public deviceId: number;
  public maxAttempts: number;
}

export class ProcessOptionsModel {
  public deviceId: number;
  public maxLines: number;
  public inputArguments: string;
  public selectedProcess: ProcessDTO;
  public selectedProcessImplementation: ProcessImplementationDTO;
  public processImplemenentations: ProcessImplementationDTO[];
  //public processConfigurations: ProcessConfigurationDTO[];
  public processes: ProcessDTO[];
  public storyCommands: StoryCommandDTO[];
  public device: DeviceModel;
  public isWrappedLines: boolean;
  public userContractId: number;
}


export enum InternalCommandType {
  Clear,
  History,
  Help,
  InvokerList,
  InvokerInvoke,
  Exit
}

///Autocomplete Command Classes
export class AutocompleteCommandDTO {
  constructor(
    public deviceId: number,
    public userContractId: number,
    //public processTypes: ProcessImplementationDTO[],
    public command: string,
    //public commandToCursor: string,
    public currentDirectory: string,
    //public shellTypeSelected: string,
    public processSelected: string,
    public commandId: number,
    //public isProcessFileChanged: boolean,
    //public currentDirectoryDirectories: string[]
  ) { }
}

export class AutocompleteResponseDTO {
  constructor() {
    this.data = new Array<string>();
    this.isTabLastKey = false;
  }
  public data: string[];
  public nextAutocomplete: number;
  public lastCommand: string;
  public isTabLastKey: boolean;
}
///END Autocomplete Command Classes



