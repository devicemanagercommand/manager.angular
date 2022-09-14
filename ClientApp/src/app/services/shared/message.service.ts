import { Injectable } from '@angular/core';
import { AlertPanel, AlertType } from '../../components/shared/alert.panel.component'

@Injectable({
  providedIn: 'root',
})
export class MessageService {

  constructor() {
    console.log("Message.Service.constructor");
  }

  Success(message: string) {
    return new AlertPanel(message, AlertType.Success);
  }

  Warn(message: string) {
    return new AlertPanel(message, AlertType.Warning);
  }

  Danger(message: string) {
    return new AlertPanel(message, AlertType.Danger);
  }

  Info(message: string) {
    return new AlertPanel(message, AlertType.Info);
  }

  Error(error: any) {
    if (error.error) {
      const resultMessage = error.error as ResultMessageDTO;
      return this.alert(resultMessage);
    }
    else if (error.message) {
      return new AlertPanel(error.message, AlertType.Danger);
    }
    else {
      return new AlertPanel(`Unexpected error ${error}`, AlertType.Danger);
    }
  }

  alert(resultMessage: ResultMessageDTO): AlertPanel {
    console.log("MessageService.alert() ...")
    const alertType: AlertType = AlertType[resultMessage.type];
    return new AlertPanel(resultMessage.message, alertType);
  }

}

export interface ResultMessageDTO {
  message: string;
  type: string;
}
