import { ProcessModel } from "src/app/models/device/process.model";
import { CommandsModel } from './commands.model';

export class DeviceModel {
  receiveFirstData: boolean;
    receiveFirstDataTime: any;
    showRemoved: boolean;

  constructor(
    public lastConnection: string,
    public description: string,
    public id: number,
    public userContractId: number,
    public imei: number,
    public uniqueCode: string,
    public options: number,
    public coordinateOptions: number,
    public webCamOptions: number,
    public webCamNetwork: number,
    public state: string,
    public osId: number,
    public isShared: boolean,
    public removed: boolean,
    public roles: string[]
  ) {
    this.processModel = new ProcessModel();
  }

  isRole(values: string): boolean {
    const splitted = values.split(",");
    return !this.isShared || this.roles && this.roles.some(o => splitted.some(x => x === o));
  }

  lastConnectionToLocal: string;


  public processModel: ProcessModel;

  cccModel: CommandsModel

}
