import { CommandActionModel } from "./command-action.model";
import { CommandCustomControlModel } from "./command-custom-control.model";

export class CommandOptionModel {
  public deviceId: number;//FK - PK
  public userContractId: number;
  public commandId: number;//FK - PK
  public commandCustomControlId: number;//FK - PK
  public id: number; //PK 

  public name: string;
  public description: string;
  public isSelected : boolean;

  public commandCustomControl: CommandCustomControlModel;
  public commandActions: Array<CommandActionModel>;

  constructor() {
    this.commandActions = new Array<CommandActionModel>();
  }
}
