import { Component, ViewChild, Output, Input, EventEmitter, HostListener } from '@angular/core';
import { ComponentPipeService, PipeMessage } from "../../services/shared/component.pipe.service";
import { ProcessService } from "../../services/device/process.service";
import { Router } from "@angular/router";
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { DeviceNavMenuComponent } from '../navmenu/deviceNavMenu.component';

@Component({
  selector: 'logout-modal',
  templateUrl: './logout.modal.component.html',
  styleUrls: ['./logout.modal.component.css']
})
export class LogoutModalComponent {
  @ViewChild('logoutModal') logoutModal: ModalDirective;
  @Output('success') success: EventEmitter<any> = new EventEmitter<any>();
  @Input() header: string;
  @Input() body: string;
  @Input() successButtonName: string;
  @Input() cancelButtonName: string;
  private isActive: boolean = false;

  constructor(private componentPipeService: ComponentPipeService,
    private processService: ProcessService,
    private router: Router,
    private modalService: BsModalService
  ) {

    console.log("LogoutModalComponent.constructor()")
    componentPipeService.listenMessage.subscribe((rsp: PipeMessage) => {
      console.log("LogoutModalComponent.constructor() listenMessage.subscribe()")
      if (rsp.message == "logout" && rsp.fromComponent.constructor.name == DeviceNavMenuComponent.name) {
        this.open();
      }
    })
  }

  @HostListener('window:keydown', ['$event'])
  hotKey_Event(event: KeyboardEvent) {

    if (this.router.url.indexOf("devices") == -1) {
      return;
    }

    if (event.keyCode == 81 && event.altKey) {//alt + q
      console.log(`LogoutModalComponent.hotKey_Event ... (isActive:${this.isActive})`);
      this.open();
    }

    if (this.isActive) {
      console.log(`LogoutModalComponent.hotKey_Event ... (isActive:${this.isActive})`);
      if (event.keyCode == 27) {
        this.cancelClick();
      }
      else if (event.keyCode == 13) {
        this.successClick();
      }
    }
  }

  successClick() {
    console.log("LogoutModalComponent.successClick()")
    if (this.success) {
      this.success.emit();
      this.cancelClick();
    }
  }

  cancelClick() {
    this.logoutModal.hide();
    this.isActive = false;
  }

  open() {
    this.logoutModal.show();
    this.isActive = true;
  }
}
