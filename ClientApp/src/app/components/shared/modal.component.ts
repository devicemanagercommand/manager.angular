import { Component, ViewChild, ElementRef, Output, Input, OnInit, EventEmitter, HostListener, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs'
import { ComponentPipeService, PipeMessage } from "../../services/shared/component.pipe.service";
import { ProcessService } from "../../services/device/process.service";
import { Router } from "@angular/router";
import { LoggerService } from "../../services/shared/logger.service";

@Component({
    selector: 'dmc-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css']
})
export class ModalComponent {
    currentItem: any;
    @ViewChild('closeModal') closeModal: ElementRef;
    @ViewChild('openModal') openModal: ElementRef;
    @Output() success: EventEmitter<any> = new EventEmitter();
    @Input() header: string;
    @Input() body: string;
    @Input() successButtonName: string;
    @Input() cancelButtonName: string;
    @Input() id: string;
    private isActive: boolean = false;


    constructor(private componentPipeService: ComponentPipeService,
        private processService: ProcessService,
        private router: Router,
        private logger: LoggerService
    ) {
        console.debug("ModalComponent.constructor()")
    }

    successClick() {
        console.debug("ModalComponent.successClick()" + this.currentItem)
        if (this.success) {
            this.success.emit(this.currentItem);
            this.cancelClick();
        }
    }

    cancelClick() {
        console.debug("ModalComponent.cancelClick()")
        this.closeModal.nativeElement.click();
        this.isActive = false;
    }

    open(item: any = null) {
        console.debug("ModalComponent.open()" + item)
        this.openModal.nativeElement.click();
        this.isActive = true;
        this.currentItem = item;
    }
}
