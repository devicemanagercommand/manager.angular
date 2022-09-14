export class ContactModel {
  public name: string;
  public mail: string;
  public subject: string;
  public message: string;

  public isLoading = false;
  public isEnabled = true;
  public captcha: string;

}
