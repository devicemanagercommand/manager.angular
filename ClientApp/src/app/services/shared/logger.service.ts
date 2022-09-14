import {
    Injectable, Inject
} from '@angular/core';
import { animate, style, trigger, state, transition } from '@angular/animations';

import { Location } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {

    constructor() {
    }

    error(message: any) {
        console.error(message);
    }

    debug(message: any) {
        console.debug(message);
    }

    info(message: any) {
        console.info(message);
    }

}

