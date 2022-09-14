import { CommandMethodModel } from "./command-method.model";
import { CommandActionValueModel } from "./command-action-value.model";
import { CommandOptionModel } from "./command-option.model";

export class CommandActionModel {
  public deviceId: number;//FK - PK
  public commandId: number;//FK - PK
  public commandCustomControlId: number;//FK - PK
  public commandOptionId: number;//FK - PK
  public id: number;//PK

  public commandMethodId: number;
  public commandMethod: CommandMethodModel;
  public commandOption: CommandOptionModel;
  public commandActionValues: Array<CommandActionValueModel>;

  constructor() {
    this.commandActionValues = new Array<CommandActionValueModel>();
  }
}
