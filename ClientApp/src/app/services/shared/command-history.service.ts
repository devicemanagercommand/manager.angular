import { Injectable, EventEmitter } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { ComponentPipeService } from "../shared/component.pipe.service";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommandHistoryService {
  allStoryCommands: any;
  currentStoryCommandIndex: number;
  storyCommands: StoryCommandDTO[];

  public Any_Error: EventEmitter<any> = new EventEmitter<any>();
  public isActive = true;
  public isInitialized = false;
  public historyCommands: HistoryCommand;

  constructor(
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService,
    private cookieService: CookieService,
    private pipeMessageCompoenent: ComponentPipeService
  ) {
    console.log("CommandHistoryService.constructor");
  }

  init(deviceId: number, userContractId: number): any {
    console.log("CommandHistoryService.init()");

    return this.list(deviceId, userContractId).subscribe();
  }

  list(deviceId: number, userContractId: number): any {
    ///Sending history commands to server
    if (!this.allStoryCommands) {
      console.log("CommandHistoryService.list()");

      const deviceDTO = { id: deviceId, userContractId: userContractId };
      const body = JSON.stringify(deviceDTO);
      return this.httpAuth.post<StoryCommandDTO[]>("api/device/commandHistory/list", body).pipe(map(
        (rsp) => {
          if (rsp) {
            this.allStoryCommands = rsp;
          }
        }
        , (error) => {
          this.Any_Error.emit(error);
        })
      );
    }
    else {
      return Observable.create(observer => { observer.next(this.allStoryCommands) });
    }
  }

  backStoryCommand() {
    if (this.storyCommands) {
      if (this.currentStoryCommandIndex >= this.storyCommands.length) {
        this.currentStoryCommandIndex = this.storyCommands.length - 1;
      }
      else {
        this.currentStoryCommandIndex--;
      }

      if (this.currentStoryCommandIndex >= 0) {
        return this.storyCommands[this.currentStoryCommandIndex].command;
      }
      else {
        return "";
      }
    }
  }

  nextStoryCommand() {
    if (this.storyCommands) {
      if (this.currentStoryCommandIndex < 0) {
        this.currentStoryCommandIndex = 0;
      }
      else {
        this.currentStoryCommandIndex++;
      }

      if (this.currentStoryCommandIndex < this.storyCommands.length) {
        return this.storyCommands[this.currentStoryCommandIndex].command;
      }
      else {
        return "";
      }
    }
  }

  saveToServer(deviceId: number, userContractId: number) {
    ///Sending history commands to server
    console.log("HistoryCommandService.saveToServer");

    const storyCommandDTOContainerDTO = new StoryCommandDTOContainerDTO(
      this.allStoryCommands,
      deviceId,
      userContractId
    );

    if (this.allStoryCommands && this.allStoryCommands.length > 0) {
      const body = JSON.stringify(storyCommandDTOContainerDTO);
      return this.httpAuth.post("/api/device/process/savestorycommands", body)
        .pipe(
          map(() => {
            //Do Nothing
          }, err => this.Any_Error.emit(err)));
    }
  }

  load() {
    let historyCommands: any = null;
    if (this.allStoryCommands)
      historyCommands = this.allStoryCommands.filter(o => o.processId == this.allStoryCommands.selectedProcess.id);

    this.storyCommands = historyCommands ? historyCommands : new Array<StoryCommandDTO>();
    this.currentStoryCommandIndex = this.storyCommands.length - 1;
  }

  saveToMemory(command: string, processId: number, deviceId: number, userContractId: number, isSucess: boolean) {
    console.log("HistoryCommandService.saveToMemory");

    this.getHistoryCommandOfProcess(processId);

    if (this.storyCommands) {
      const sameCommand = this.storyCommands.find(
        o => o.command.trim() == command.trim()
          && o.processId == processId);

      const storyCommand = new StoryCommandDTO(
        command.trim(),
        processId,
        deviceId,
        userContractId,
        isSucess
      );

      if (command && !sameCommand && command.trim() != "") {

        this.currentStoryCommandIndex++;///New command

      }
      else if (sameCommand) {
        //Update the last success of command if already exist
        sameCommand.isSuccess = isSucess;

        this.storyCommands = this.storyCommands.filter(o => !(o.command.trim() == command.trim() && o.processId == processId));
        this.allStoryCommands = this.allStoryCommands.filter(o => !(o.command.trim() == command.trim() && o.processId == processId));
      }

      this.storyCommands.push(storyCommand);
      ///Adding storyCommand to filter in processOption component when a process is changed
      this.allStoryCommands.push(storyCommand);
    }
  }

  getHistoryCommandOfProcess(processId: number) {
    if (this.allStoryCommands) {
      this.storyCommands = this.allStoryCommands.filter(o => o.processId == processId);
      this.currentStoryCommandIndex = this.storyCommands.length;
      return this.storyCommands;
    } else {
      return new Array<StoryCommandDTO>();
    }
  }

}

export class HistoryCommand {
  constructor(
    public storyCommands: StoryCommandDTO[],///Story Command 
    public currentStoryCommandIndex: number,
    public allStoryCommands: StoryCommandDTO[],///Story Command 
  ) {
  }
}

///Story Commands DTO 
export class StoryCommandDTO {
  constructor(
    public command: string,
    public processId: number,
    public deviceId: number,
    public userContractId: number,
    public isSuccess: boolean
  ) {

  };
}

export class StoryCommandDTOContainerDTO {
  constructor(
    public storyCommands: Array<StoryCommandDTO>,
    public deviceId: number,
    public userContractId: number
  ) { };
}
///END Story Commands DTO



///END Invokers DTO
