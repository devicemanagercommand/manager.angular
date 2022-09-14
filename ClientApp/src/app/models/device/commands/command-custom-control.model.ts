import { CommandControlModel } from "./command-control.model";
import { DeviceModel } from "../device.model";
import { CommandModel } from "./command.model";
import { CommandOptionModel } from "./command-option.model";
import { CommandConfigurationModel } from './command-configuration.model';
import { TerminalLine } from 'src/app/services/device/process.service';

export class CommandCustomControlModel {
  public deviceId: number; //FK - PK
  public commandId: number;//FK - PK
  public id: number = 0;//PK

  public name: string;//Could be the label of a switch button.

  public commandControlId: number;//FK

  public commandControl: CommandControlModel;
  public device: DeviceModel;
  public command: CommandModel;

  public commandOptions: Array<CommandOptionModel>;
  public isExecutingCommand: boolean = false;
  public responseLines: TerminalLine[];
  public selectedOption: CommandOptionModel;
  public userContractId: number;

}
