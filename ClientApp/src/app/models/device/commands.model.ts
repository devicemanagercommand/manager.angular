import { DeviceModel } from "./device.model";
import { CommandCustomControlModel } from "./commands/command-custom-control.model";
import { CommandControlModel } from "./commands/command-control.model";
import { CommandModel } from "./commands/command.model";
import { CommandOptionModel } from "./commands/command-option.model";
import { CommandMethodModel } from "./commands/command-method.model";
import { NgForm } from "@angular/forms";
import { CommandConfigurationModel } from './commands/command-configuration.model';

export class CommandsModel {
  public commandCustomControl: Array<CommandCustomControlModel>;
  public commandControl: Array<CommandControlModel>;
  public command: Array<CommandModel>;
  public commandOptionsAddRemoveDisabled: boolean;
  public commandConfiguration: CommandConfigurationModel;

  public newCustomControl: CommandCustomControlModel;
  public selectedCommand: CommandModel;
  public selectedMethods: CommandMethodModel[];

  public controlStepName: string;
  public commandStepName: string;
  public methodStepName: string;
  public summaryStepName: string;

  public controlStepForm: NgForm;//First step
  public commandStepForm: NgForm;//Second step
  public methodStepForm: NgForm;//3th step
  public summaryStepForm: NgForm;//4th step
  newCustomControlIfCancel: CommandCustomControlModel;
  public disableModule = false;
  public isLoaded = false;

  constructor(
    public device: DeviceModel

  ) {
  }

}
