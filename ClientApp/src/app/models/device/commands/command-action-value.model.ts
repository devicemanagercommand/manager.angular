import { CommandPropertyModel } from "./command-property.model";
import { CommandActionModel } from "./command-action.model";

export class CommandActionValueModel {
  public deviceId: number;//FK - PK
  public commandId: number;//FK - PK
  public commandCustomControlId: number;//FK - PK
  public commandOptionId: number;//FK - PK
  public commandActionId: number;//FK - PK
  public id: number;//PK

  public value: string;

  public commandPropertyId: number;// FK
  public commandProperty: CommandPropertyModel;
  public commandAction: CommandActionModel;
}
