import { CommandMethodModel } from "./command-method.model";

export class CommandModel {
  public id: number;
  public guid: string;
  public name: string;
  public interfaceType: string;
  public description: string;
  public operativeSystem: string;

  public methods: Array<CommandMethodModel>;
}
