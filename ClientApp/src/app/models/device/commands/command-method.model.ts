import { CommandPropertyModel } from "./command-property.model";
import { CommandModel } from "./command.model";

export class CommandMethodModel {
  public id: number;
  public name: string;

  public properties: Array<CommandPropertyModel>;
  public command: CommandModel;
  public commandId: number;
}
