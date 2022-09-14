import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProcessService } from '../../../services/device/process.service';
import { Observable } from "rxjs";

//Resolver Explained Here https://stackoverflow.com/a/38313301
@Injectable()
export class ProcessResolve implements Resolve<any> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //return Observable.fromPromise(this.processService.getProcessOptionsModel());
    }

    constructor(public processService: ProcessService) {
        console.log("ProcessResolve.constructor");
    }
}

