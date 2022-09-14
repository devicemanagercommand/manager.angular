import { Component } from '@angular/core';
import { LangService } from '../../services/shared/lang.service'

@Component({
    selector: 'loading',
    exportAs: 'loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.css']
})
export class LoadingComponent {

    constructor(public rs: LangService)
    { }

    public isLoading =  false;

    public showLoading() {
        this.isLoading = true;
    }

    public hideLoading() {
        this.isLoading = false;
    }
}

