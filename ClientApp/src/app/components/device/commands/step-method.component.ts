import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { DeviceInfoDTO, DeviceInfoService, PeriphericDTO, PeriphericValueDTO } from '../../../services/device/deviceInfo.service'
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { AlertPanelComponent, AlertPanel, AlertType } from "../../../components/shared/alert.panel.component"
import { MessageService } from "../../../services/shared/message.service";
import { LoggerService } from "../../../services/shared/logger.service";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommandsModel } from '../../../models/device/commands.model';
import { FormGroup, UntypedFormBuilder, Validators, NgForm } from '@angular/forms';
import { CommandOptionModel } from '../../../models/device/commands/command-option.model';
import { CommandControlModel } from '../../../models/device/commands/command-control.model';
import { CommandService } from '../../../services/device/command.service';
import { CommandMethodModel } from '../../../models/device/commands/command-method.model';
import { CommandActionModel } from '../../../models/device/commands/command-action.model';
import { CommandActionValueModel } from '../../../models/device/commands/command-action-value.model';
import { CommandPropertyModel } from '../../../models/device/commands/command-property.model';


@Component({
    selector: 'step-method',
    templateUrl: './step-method.component.html',
    styleUrls: ['./step-method.component.scss'],
})
export class StepMethodComponent {
    deviceId: number;
    public alert: AlertPanel;
    urlParamSubscription: Subscription;

    isLinear = false;
    @ViewChild('methodStepForm') public methodStepForm: NgForm = new NgForm(null, null);

    test: string;

    constructor(
        public rs: LangService,
        public route: ActivatedRoute,
        public deviceInfoService: DeviceInfoService,
        public messageService: MessageService,
        public logger: LoggerService,
        private _formBuilder: UntypedFormBuilder,
        public commandService: CommandService,
        public snackBar: MatSnackBar,
    ) {
    }

    ngOnInit() {
        setTimeout(() => {

        }, 1);
    }

    commandControlChange(event: MatRadioChange) {
        let cc: CommandControlModel = event.value;

        this.commandService.loadCommandControl(cc);
    }

    esm = {
        isErrorState: () => { return true }
    }

    addAction(e, selectedMethod: CommandMethodModel, i: number) {
        if (this.commandService.model.commandConfiguration.maxActions
            <= this.commandService.model.newCustomControl.commandOptions[i].commandActions.length) {
            this.snackBar.open(this.rs.Resource("WarnMaxItems"), null, { duration: 1500 });
        }
        else {
            try {
                this.commandService.addAction(selectedMethod, this.commandService.model.newCustomControl.commandOptions[i]);

                //this.commandService.model.selectedMethods[i] = null;

            } catch (ex) {
                this.snackBar.open(this.rs.Resource("WarnItemAlreadyExists"), "", { duration: 1500 });
                console.error(ex);
            }
        }

    }

    removeAction(e, commandOption: CommandOptionModel, actionToRemove: CommandActionModel) {
        commandOption.commandActions = commandOption.commandActions.filter(x => x.id != actionToRemove.id);
    }

    canAddAction(selectedMethod: CommandMethodModel) {
        if (!selectedMethod || !selectedMethod.properties || selectedMethod.properties.length == 0) {
            return false;
        }

        for (let parameter of selectedMethod.properties) {
            if (parameter.commandPropertyType.name == 'object') {
                for (let property of parameter.commandProperties) {

                    let regx: RegExp = null;
                    if (property.regexValidation != null && property.regexValidation != "") {
                        regx = new RegExp(property.regexValidation);
                    }

                    if (property.commandPropertyType.name != 'object'
                        && property.commandPropertyType.name != 'boolean'
                        && (property.value == null || property.value == ""
                            || (regx != null && !regx.test(property.value))
                            || (property.commandPropertyType.name == 'number' && ((property.minLength != null && property.value < property.minLength) || (property.maxLength != null && property.value > property.maxLength)))
                            || (property.commandPropertyType.name == 'string' && ((property.minLength != null && property.value.length < property.minLength) || (property.maxLength != null && property.value.length > property.maxLength)))
                        )
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

}



  //ngOnInit() {
  //  //Url parameters
  //  this.urlParamSubscription = this.route.params.subscribe(params => {
  //    this.deviceId = +params['id'];// (+) converts string 'id' to a number

  //  });
  //}


  //ngOnDestroy() {
  //  this.urlParamSubscription.unsubscribe();
  //}
