import { Input, OnChanges, Component, SimpleChanges } from '@angular/core';
import { TriggerHelper } from '../../services/shared/helper.service';

@Component({
  selector: 'alert-panel',
  templateUrl: './alert.panel.component.html',
  styleUrls: ['./alert.panel.component.scss'],
  animations: [
    TriggerHelper.verticalheight(".alert, .close")
  ]
})

export class AlertPanelComponent implements OnChanges {

  @Input()
  input: AlertPanel;

  model: AlertPanelModel;

  ngOnChanges(changes: SimpleChanges) {
    console.debug("AlertPanel.OnChanges");

    if (this.input != null) {
      if (this.model == null) {
        this.model = new AlertPanelModel(this.input.message, this.input.type);
      }

      this.model.message = this.input.message;
      this.model.isEdited = true;
      switch (this.input.type) {
        case AlertType.Danger: this.model.typeName = "danger"; break;
        case AlertType.Warning: this.model.typeName = "warning"; break;
        case AlertType.Info: this.model.typeName = "info"; break;
        case AlertType.Success: this.model.typeName = "success"; break;
      }
    }
  }


  closeAlert() {
    this.model = null;
  }
}

export class AlertPanel {
  constructor(public message: string, public type: AlertType) {
  }
}

class AlertPanelModel extends AlertPanel {
  typeName: string;
  isEdited: boolean;
}

export class AlertType {
  static readonly Warning = "Warning";
  static readonly Danger = "Danger";
  static readonly Info = "Info";
  static readonly Success = "Success";
  static readonly Default = "Default";
}

