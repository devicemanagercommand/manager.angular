import { Component, ViewChild, ElementRef, Output, Input, OnInit, EventEmitter, HostListener, Renderer2, Inject } from '@angular/core';
import { Observable } from 'rxjs'
import { LangService } from '../../../services/shared/lang.service'
import {
  ProcessService, ProcessCommandDTO, ProcessConfigurationDTO,
  ProcessImplementationDTO, ProcessResponseDTO, ProcessDTO, ProcessOptionsModel
} from '../../../services/device/process.service';
import { ComponentPipeService, PipeMessage } from "../../../services/shared/component.pipe.service";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'process-options',
  templateUrl: './process.options.component.html',
  styleUrls: ['./process.options.component.scss']
})

export class ProcessOptionsComponent implements OnInit {
  public model: ProcessOptionsModel;
  @Output('success') success: EventEmitter<any> = new EventEmitter<any>();
  @Input() header: string;
  @Input() body: string;
  @Input() successButtonName: string;
  @Input() cancelButtonName: string;
  public isActive: boolean;

  constructor(
    public rs: LangService,
    public processService: ProcessService,
    //@Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("ProcessOptionsComponent.constructor()");
    /*this.processService.processModel_Loaded.subscribe(model => {*/
    console.log("ProcessOptionsComponent.constructor().processMode_Loaded ... ");
    this.model = this.processService.processOptions;
    //});
  }

  ngOnInit() {
    console.log("ProcessOptionsComponent.ngOnInit()");
    this.isActive = false;
  }

  successClick() {
    console.log("ProcessOptionsComponent.successClick()")

    this.processService.saveProcessOptions();
    this.cancelClick();
  }

  cancelClick() {
    this.processService.isActive = true;
    this.isActive = false;
  }

  open() {
    this.processService.isActive = false;
    this.isActive = true;
  }

  @HostListener('window:keydown', ['$event'])
  hotKey_Event(event: KeyboardEvent) {

    console.log(`ProcessOptionsComponent.hotKey_Event ... (isActive:${this.isActive})`);
    if (event.keyCode == 79 && event.altKey) {
      //this.processService.openConfigurationWindow();
      this.open();
    }

    if (this.processService.isActive == false && this.isActive) {
      if (event.keyCode == 27) {
        console.log("esc");
        this.cancelClick();
      }
      else if (event.keyCode == 13) {
        this.successClick();
      }
    }
  }

  selectedItem_Click(item: ProcessDTO) {
    this.model.selectedProcess = item;
    this.processService.historyCommandService.storyCommands
      = this.processService.processOptions.storyCommands.filter(o => o.processId == item.id);
  }
}


