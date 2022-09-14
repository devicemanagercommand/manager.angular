import { DeviceModel } from "./device.model";
import { SharedUserModel } from '../identity/shared-user-model';

export class SettingsModel {

  public mail: string;
  public enableShare = true;
  public sharedUsers: SharedUserModel[];
    sharedUsersDataSource: any;

  constructor(
    public device: DeviceModel,
  ) {
  }

}
