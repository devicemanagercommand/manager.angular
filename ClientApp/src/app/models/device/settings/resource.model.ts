
export class ResourceModel {
  constructor(
    public remoteId: string,//DeviceId,
    public userId: number, //Owner of device
    public mail: string,
    public categoryResourceId: number,
    public name: string
  ) {
  }
}
