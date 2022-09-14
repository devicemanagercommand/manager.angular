import { Component, Output, EventEmitter, TemplateRef } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { ComponentPipeService, PipeMessage } from '../../../services/shared/component.pipe.service'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'nav-menu',
  templateUrl: './navmenu.component.html',
  styleUrls: [
    './navmenu.component.css'
    , './navmenu.component.banner.scss'
  ]
})
export class NavMenuComponent {
  modal: BsModalRef;
  modalRef: BsModalRef;
  isMobile: boolean;

  constructor(public rs: LangService
    , public componentPipeService: ComponentPipeService
    , private modalService: BsModalService
  ) {
    console.debug("NavMenuComponent.constructor()")
    this.isMobile = localStorage.getItem("isMobile") === "true";

  }

  loginInit() {
    console.debug("NavMenuComponent.loginInit()");
    //this.componentPipeService.SendMessage(new PipeMessage(this, LoginComponent,"login open"))
    this.modal = this.modalService.show(LoginComponent);
    this.modal.content.loginModal = this.modal;
    this.modal.setClass("login-modal")

  }

}
