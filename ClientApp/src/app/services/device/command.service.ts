import { Injectable, EventEmitter, isDevMode } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { ComponentPipeService } from "../shared/component.pipe.service";
import { CommandsModel } from '../../models/device/commands.model';
import { DeviceModel } from '../../models/device/device.model';
import { CommandOptionModel } from '../../models/device/commands/command-option.model';
import { CommandCustomControlModel } from '../../models/device/commands/command-custom-control.model';
import { CommandControlModel } from '../../models/device/commands/command-control.model';
import { CommandActionModel } from '../../models/device/commands/command-action.model';
import { CommandMethodModel } from '../../models/device/commands/command-method.model';
import { CommandActionValueModel } from 'src/app/models/device/commands/command-action-value.model';
import { NgForm } from '@angular/forms';
import { InvokerService, InvokerMethodParamDTO, InvokerMethodParamValueDTO, InvokerMethodResponse } from './invoker.service';
import { CommandPropertyModel } from 'src/app/models/device/commands/command-property.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommandService {

  public model: CommandsModel;
  public Any_Error: EventEmitter<any> = new EventEmitter<any>();
  public isActive = true;
  public isInitialized = false;
  public _isDevMode: boolean;

  constructor(
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService,
    private cookieService: CookieService,
    private pipeMessageCompoenent: ComponentPipeService,
    private invokerService: InvokerService,
  ) {
    console.log("CommandService.constructor");
    this._isDevMode = isDevMode();
  }

  init(device: DeviceModel): Observable<CommandsModel> {
    console.log("CommandService.init()");


    this.model = new CommandsModel(device);//Always should be set, to prevent merge model between two devices.

    if (!device.cccModel) {
      device.cccModel = new CommandsModel(device);
    }

    if (device.cccModel.isLoaded) {
      this.model = device.cccModel; // this.CloneCCCModel(device.cccModel);

      this.model.disableModule = !this.model.command || this.model.command.length == 0;
      if (!this.model.command || this.model.command.length == 0) {
        throw { message: this.rs.Resource("WarnNoCommands"), type: "warning" };
      }

      return Observable.create(observer => { observer.next(device.cccModel) });
    }
    else {
      return this.list(device).pipe(map(rsp => {

        this.model.command = rsp.command.filter(o => o.operativeSystem.split(",").find(b => b == device.osId.toString()));
        this.model.disableModule = !this.model.command || this.model.command.length == 0;
        if (!this.model.command || this.model.command.length == 0) {
          throw { message: this.rs.Resource("WarnNoCommands"), type: "warning" };
        }

        this.model.commandControl = rsp.commandControl.sort((a, b) => a.id - b.id);
        this.model.commandCustomControl = rsp.commandCustomControl
        this.model.newCustomControl = new CommandCustomControlModel();
        this.model.newCustomControl.commandOptions = new Array<CommandOptionModel>();
        this.model.newCustomControl.commandControlId = rsp.commandControl[0].id;
        this.model.newCustomControl.commandControl = rsp.commandControl[0];
        this.model.commandConfiguration = rsp.commandConfiguration;
        this.loadCommandControl(this.model.newCustomControl.commandControl);

        this.model.controlStepForm = new NgForm(null, null);
        this.model.commandStepForm = new NgForm(null, null);
        this.model.methodStepForm = new NgForm(null, null);
        this.model.summaryStepForm = new NgForm(null, null);

        this.model.commandStepName = this.rs.Resource("LabelCommand");
        this.model.controlStepName = this.rs.Resource("LabelControl");
        this.model.methodStepName = this.rs.Resource("LabelMethod");
        this.model.summaryStepName = this.rs.Resource("LabelSummary");

        for (let ccc of this.model.commandCustomControl) {
          ccc.selectedOption = ccc.commandOptions.find(o => o.isSelected);
        }

        //Setting default value of boolean types
        for (let c of this.model.command) {
          for (let m of c.methods) {
            for (let p of m.properties) {
              if (p.commandPropertyType.name == "object") {
                this.DefaultValueOfProperties(p);
              }
              else {
                if (p.commandPropertyType.name == "boolean") {
                  p.value = "false";
                }
              }
            }
          }
        }

        if (this._isDevMode) {
          const option1 = new CommandOptionModel();
          option1.name = "test";
          this.model.newCustomControl.name = "test label";
          this.model.newCustomControl.commandOptions = [option1];
          if (rsp.command.length > 0) {
            this.model.newCustomControl.commandId = rsp.command[0].id;
          }

          this.model.selectedCommand = rsp.command[0];
        }

        const cccModelCloned = this.CloneCCCModel(this.model);
        cccModelCloned.isLoaded = true;
        device.cccModel = cccModelCloned;//this.model; Cloned to doesn't interfer in other device cccModel.
        this.model = cccModelCloned;
        return this.model;
      }));
    }
  }

  //Warning Clone Ignore Deletes Of CCC in this.model, because the model is regenerate from device in memory.
  CloneCCCModel(commandsModel: CommandsModel): CommandsModel {
    const commandModelCloned = new CommandsModel(commandsModel.device);
    commandModelCloned.command = commandsModel.command;
    commandModelCloned.commandConfiguration = commandsModel.commandConfiguration;
    commandModelCloned.commandControl = commandsModel.commandControl;
    commandModelCloned.commandCustomControl = commandsModel.commandCustomControl;
    commandModelCloned.commandOptionsAddRemoveDisabled = commandsModel.commandOptionsAddRemoveDisabled;
    commandModelCloned.newCustomControl = commandsModel.newCustomControl;
    commandModelCloned.newCustomControlIfCancel = commandsModel.newCustomControlIfCancel;
    commandModelCloned.selectedCommand = commandsModel.selectedCommand;
    commandModelCloned.selectedMethods = commandsModel.selectedMethods;

    commandModelCloned.controlStepForm = new NgForm(null, null);
    commandModelCloned.commandStepForm = new NgForm(null, null);
    commandModelCloned.methodStepForm = new NgForm(null, null);
    commandModelCloned.summaryStepForm = new NgForm(null, null);
    commandModelCloned.commandStepName = this.rs.Resource("LabelCommand");
    commandModelCloned.controlStepName = this.rs.Resource("LabelControl");
    commandModelCloned.methodStepName = this.rs.Resource("LabelMethod");
    commandModelCloned.summaryStepName = this.rs.Resource("LabelSummary");
    commandModelCloned.disableModule = commandsModel.disableModule;

    return commandModelCloned;
  }

  DefaultValueOfProperties(p: CommandPropertyModel): any {
    for (const prop of p.commandProperties) {
      if (prop.commandPropertyType.name == "object") {
        this.DefaultValueOfProperties(prop);
      }
      else {
        if (prop.commandPropertyType.name == "boolean") {
          prop.value = false;
        }
      }
    }
  }

  list(device: DeviceModel): Observable<CommandsModel> {
    ///Sending history commands to server
    if (!device.cccModel.commandCustomControl) {
      console.log("CommandService.list()");
      const deviceDTO = { id: device.id, userContractId: device.userContractId };
      const body = JSON.stringify(deviceDTO);
      return this.httpAuth.post<CommandsModel>("api/plugin/commands/list", body).pipe(map(
        (rsp) => {
          if (rsp) {
            this.isInitialized = true;
            return rsp;
          }
        }
      ));
    }
    else {
      return Observable.create(observer => { observer.next(this.model) });
    }
  }

  loadCommandControl(ccm: CommandControlModel) {

    const multiplicity = ccm.multiplicity;
    const anotherArray = new Array<CommandOptionModel>();

    if (multiplicity == "1" || multiplicity == "2" || multiplicity == "?") {
      this.model.selectedMethods = new Array<CommandMethodModel>();
      this.model.commandOptionsAddRemoveDisabled = multiplicity != "?";

      let totalOptions = multiplicity == "?" ? 3 : +multiplicity;

      for (let i = 0; i < totalOptions; i++) {
        let com = new CommandOptionModel();
        com.id = i + 1;
        com.commandActions = new Array<CommandActionModel>();
        anotherArray.push(com);

        this.model.selectedMethods.push(new CommandMethodModel());
      }

      this.model.newCustomControl.commandOptions = anotherArray;

    }
    this.model.newCustomControl.commandControlId = ccm.id;
    this.model.controlStepName = this.rs.Resource(ccm.name);
  }

  //
  addOption() {
    const newArray = Object.assign([], this.model.newCustomControl.commandOptions); //Clone array

    const maxId = Math.max.apply(Math, newArray.map(function (o) { return o.id; }))//Max id

    const com = new CommandOptionModel();
    com.id = maxId + 1;
    com.commandActions = new Array<CommandActionModel>();
    newArray.push(com);

    this.model.newCustomControl.commandOptions = newArray;
  }

  removeOption() {
    if (this.model.newCustomControl.commandOptions && this.model.newCustomControl.commandOptions.length > 3) {
      const newArray = Object.assign([], this.model.newCustomControl.commandOptions); //Clone array
      newArray.pop();
      this.model.newCustomControl.commandOptions = newArray;
    }
  }

  addAction(selectedMethod: CommandMethodModel, commandOption: CommandOptionModel): any {
    //Validating if command is already added

    this.addActionValidation(selectedMethod, commandOption);
    const commandAction = new CommandActionModel();
    commandAction.commandMethod = selectedMethod;
    commandAction.commandMethodId = selectedMethod.id;

    const ids = commandOption.commandActions.map(o => o.id) as number[];
    commandAction.id = (Math.max(...ids) == -Infinity ? 0 : Math.max(...ids)) + 1;
    //commandAction.commandOption = commandOption; This causes circular reference
    commandOption.commandActions.push(commandAction);

    for (let parameter of selectedMethod.properties) {
      if (parameter.commandPropertyType.name != 'object') {

      } else {

        for (let property of parameter.commandProperties) {
          if (property.commandPropertyType.name != 'object') {

            let commandActionValue = new CommandActionValueModel();
            //commandActionValue.commandAction = commandAction; Don't add, This causes circular reference

            commandActionValue.commandProperty = property;
            commandActionValue.commandPropertyId = property.id;
            commandActionValue.value = property.value;
            commandAction.commandActionValues.push(commandActionValue);
          }
          else {
            //Recursive over properties of property
          }
        }

      }
    }

    this.cleanValuesOfMethod(selectedMethod);

  }
  addActionValidation(selectedMethod: CommandMethodModel, commandOption: CommandOptionModel): any {

    let selectedMethodConverted = this.methodToAction(selectedMethod);

    let actions = commandOption.commandActions.filter(o => o.commandMethod.id == selectedMethod.id);

    if (actions) {

      let isEquals = false;
      for (let action of actions) {

        isEquals = false;
        for (let actionProp of action.commandActionValues) {

          let prop = selectedMethodConverted.commandActionValues.find(
            x => actionProp.commandProperty.name == x.commandProperty.name
              && actionProp.value == x.value);

          if (prop) {
            isEquals = true;
          }
          else {
            isEquals = false;
            break;
          }
        }

        if (isEquals == true) {
          throw this.rs.Resource("WarnItemAlreadyAdded");
        }

      }
    }

  }

  methodToAction(method: CommandMethodModel): CommandActionModel {

    let commandAction = new CommandActionModel();
    commandAction.commandMethod = method;

    for (let parameter of method.properties) {

      if (parameter.commandPropertyType.name != 'object') {

      } else {

        for (let property of parameter.commandProperties) {
          if (property.commandPropertyType.name != 'object') {

            let commandActionValue = new CommandActionValueModel();
            commandActionValue.commandAction = commandAction;
            commandActionValue.commandProperty = property;
            commandActionValue.value = property.value;
            commandAction.commandActionValues.push(commandActionValue);
          }
          else {
            //Recursive over properties of property
          }
        }

      }
    }
    return commandAction;
  }

  addNewCustomCommand(): Observable<any> {
    ///Sending history commands to server
    if (this.model.newCustomControl != null) {
      console.log("CommandService.addNewCustomCommnad()");

      this.model.newCustomControl.deviceId = this.model.device.id;
      this.model.newCustomControl.userContractId = this.model.device.userContractId;
      const body = JSON.stringify(this.model.newCustomControl);

      return this.httpAuth.post("api/plugin/commands/neworupdate", body).pipe(map(
        (rsp) => {
          if (this.model.newCustomControl.id == 0) {

            const newCCC = rsp as CommandCustomControlModel;
            const clonedCCC = JSON.parse(body) as CommandCustomControlModel;

            clonedCCC.id = newCCC.id;

            this.model.commandCustomControl.push(clonedCCC);
          }

          this.cleanAddNewCustomControl();
          if (rsp) {
            return rsp;
          }
        }
      ));
    }
    else {
      return Observable.create(observer => { observer.next(this.model) });
    }
  }
  cleanAddNewCustomControl(): any {
    if (this.model.selectedMethods) {

      this.model.selectedMethods.forEach((item, index) => {
        this.cleanValuesOfMethod(this.model.selectedMethods[index]);
        this.model.selectedMethods[index] = null;
      });

    }

    this.model.newCustomControl = new CommandCustomControlModel();
    this.model.newCustomControl.commandOptions = new Array<CommandOptionModel>();
    this.model.newCustomControl.commandControl = this.model.commandControl[0];

    this.model.selectedCommand = null;

    this.loadCommandControl(this.model.commandControl[0]);

  }

  get methodStepIsValid(): boolean {
    if (this.model.newCustomControl && this.model.newCustomControl.commandOptions) {
      for (let option of this.model.newCustomControl.commandOptions) {
        if (!option.commandActions || option.commandActions.length === 0) {
          return false;
        }
      }
    }
    return true;
  }

  DeleteCommand(commandCustomControl: CommandCustomControlModel): any {
    console.debug("CommandService.DeleteCommand()");

    commandCustomControl.deviceId = this.model.device.id;
    const body = JSON.stringify(commandCustomControl);

    return this.httpAuth.post("api/plugin/commands/delete", body).pipe(map(
      () => {

        this.model.commandCustomControl = this.model.commandCustomControl.filter
          (x =>
            !(x.id == commandCustomControl.id
              && x.commandId == commandCustomControl.commandId
              && x.deviceId == commandCustomControl.deviceId
              && x.userContractId == commandCustomControl.userContractId
            )
          );
      }
    ));
  }

  executeCommand(commandOption: CommandOptionModel): Observable<InvokerMethodResponse[]> {

    const invokerMethodParams = new Array<InvokerMethodParamDTO>();

    for (const action of commandOption.commandActions) {//Action

      const command = this.model.command.find(o => o.id == action.commandMethod.commandId);

      commandOption.deviceId = this.model.device.id;//bug for commands created without device id
      commandOption.userContractId = this.model.device.userContractId;

      const invokerMethodParam = new InvokerMethodParamDTO(
        command.guid,
        command.interfaceType,//invoker.interfaceType,
        action.commandMethod.name, //method.methodInfo.name,
        null,//Added next
        this.model.device.id, //deviceId
        this.model.device.userContractId
      );

      invokerMethodParams.push(invokerMethodParam);

      const method = command.methods.find(o => o.id == action.commandMethodId);
      const inverkerMethodParamValues = new Array<InvokerMethodParamValueDTO>();

      for (const param of method.properties) { //Params

        if (param.commandPropertyType.name == "object") {
          const jsonObject = this.getJsonObject(param, action);
          const invokerParamValue = new InvokerMethodParamValueDTO(null, jsonObject);
          inverkerMethodParamValues.push(invokerParamValue);

        } else {
          const value = action.commandActionValues.find(o => o.commandPropertyId == param.id);
          const jsonObject = `"${param.name}":"${value.value}",`;
          const invokerParamValue = new InvokerMethodParamValueDTO(null, jsonObject);
          inverkerMethodParamValues.push(invokerParamValue);

        }

      }

      invokerMethodParam.params = inverkerMethodParamValues;
    }

    return this.invokerService.invokes(invokerMethodParams).pipe(map(o => {
      this.saveOption(commandOption).subscribe(o => { });//Silent save
      return o;
    }));

  }

  saveOption(commandOption: CommandOptionModel): Observable<any> {
    const body = JSON.stringify(commandOption);

    return this.httpAuth.post<InvokerMethodResponse[]>("/api/plugin/commands/saveselectedoption", body).pipe(
      map(() => {
        console.debug("saveselectedoption() done")
      }));
  }

  getJsonObject(param: CommandPropertyModel, action: CommandActionModel): string {
    let jsonObject = "{"

    for (let prop of param.commandProperties) {

      if (prop.commandPropertyType.name == "object") {
        jsonObject += `"${prop.name}":`
        jsonObject += this.getJsonObject(prop, action);
        jsonObject += ","
      } else {
        let value = action.commandActionValues.find(o => o.commandPropertyId == prop.id);
        if (prop.commandPropertyType.name == "boolean") {
          value.value = (`${value.value}` == 'true' ? 'true' : 'false');
        }
        jsonObject += `"${prop.name}":"${value.value}",`;
      }
    }

    jsonObject = jsonObject.substring(0, jsonObject.length - 1);
    jsonObject += "}"

    return jsonObject;

  }

  cleanValuesOfMethod(method: CommandMethodModel): any {
    if (method && method.properties) {
      for (let prop of method.properties) {
        if (prop.commandPropertyType.name == "object") {
          this.cleanValuesOfProperty(prop);
        }
        else {
          prop.value = "";
        }
      }
    }
  }

  cleanValuesOfProperty(propArg: CommandPropertyModel): any {
    if (propArg.commandProperties) {
      for (let prop of propArg.commandProperties) {
        if (prop.commandPropertyType.name == "object") {
          this.cleanValuesOfProperty(prop);
        }
        else {
          prop.value = "";
        }
      }
    }
  }

  editCommandCustomControl(commandCustomControl: CommandCustomControlModel): any {
    this.model.newCustomControl = commandCustomControl;
    this.model.newCustomControlIfCancel = JSON.parse(JSON.stringify(commandCustomControl)) as CommandCustomControlModel;
    this.model.selectedCommand = this.model.command.find(o => o.id == this.model.newCustomControl.commandId);
    this.model.newCustomControl.commandControl = this.model.commandControl.find(x => x.id == commandCustomControl.commandControlId);
  }

  //Do it after assign a newCustomControl instance (new newCustomControl()), because you don't change the reference
  cancel(): any {
    if (this.model.newCustomControlIfCancel) {
      this.model.newCustomControl.name = this.model.newCustomControlIfCancel.name;
      this.model.newCustomControl.commandControl = this.model.newCustomControlIfCancel.commandControl;
      this.model.newCustomControl.commandId = this.model.newCustomControlIfCancel.commandId;
      this.model.newCustomControl.commandOptions = this.model.newCustomControlIfCancel.commandOptions;
      this.model.newCustomControl.commandControlId = this.model.newCustomControlIfCancel.commandControlId;
    }
    //this.loadCommandControl(this.model.newCustomControl.commandControl)
  }


}
///END Invokers DTO
