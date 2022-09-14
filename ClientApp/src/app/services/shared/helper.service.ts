import {
  Injectable
} from '@angular/core';
import { animate, style, trigger, state, transition, query } from '@angular/animations';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class HelperService {
  public windowHash: OsBinaryHash[];

  constructor(private http: HttpClient,
    private location: Location,
    private router: Router
  ) {
    console.log("Helper.Service.Constructor");
    this.http = http;
    this.http.get('/api/device/helper/hashes').subscribe(result => {
      this.windowHash = result as OsBinaryHash[];
    });
  }

  getHash(os: string): string {
    if (this.windowHash === undefined) {
      return "";
    }
    else {
      const find = this.windowHash.find(x => x.os === os);
      return find === null ? "[hash not found]" : find.hash;
    }
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  backHistory() {
    this.location.back();
  }

  refresh() {
    window.location.reload();
  }

  cursorToFinal(elmt) {

    setTimeout(() => {
      const start = elmt.selectionStart;
      const caretPos = start + elmt.value.length;
      elmt.setSelectionRange(caretPos, caretPos);
    }, 0);
  }
}

export interface OsBinaryHash {
  hash: string;
  os: string;
}

@Injectable({
  providedIn: 'root',
})
export class TriggerHelper {
  public static sendToLeft(triggerName: string) {
    return trigger(triggerName, [
      state('void', style({
        position: 'absolute', width: '100%', height: '100%', transform: 'translateX(-100%)'
        , top: '0px'
      })),
      state('*', style({ position: 'absolute', width: '100%', height: '100%', top: '0px' })),
      transition('void => *', animate('500ms ease-in', style({ transform: 'translateX(0%)' }))),
      transition('* => void', animate('500ms ease-out', style({ transform: 'translateX(-100%)' })))
    ])
  }

  public static sendToRight(triggerName: string) {
    return trigger(triggerName, [
      state('void', style({ position: 'absolute', width: '100%', height: '100%', transform: 'translateX(100%)', top: '0px' })),
      state('*', style({ position: 'absolute', width: '100%', height: '100%', top: '0px' })),
      transition('* => void', animate('500ms ease-in', style({ transform: 'translateX(100%)' }))),
      transition('void => *', animate('500ms ease-out', style({ transform: 'translateX(0%)' })))
    ])
  }

  public static opacity(triggerName: string) {
    return trigger(triggerName, [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms  ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms  ease-out', style({ opacity: 0 }))
      ])
    ])
  }

  public static opacityPage(triggerName: string) {
    return trigger(triggerName, [
      transition('void => *', [
        style({ opacity: 0, zIndex: 99991, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }),
        animate('250ms  ease-in', style({ opacity: 1 })),
      ]),
      transition('* => void', [
        style({ opacity: 1, zIndex: 99999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }),
        animate('250ms  ease-out', style({ opacity: 0 }))
      ])
    ])
  }

  public static opacityPageWithNav(triggerName: string) {
    return trigger(triggerName, [
      transition('void => *', [
        style({ opacity: 0, zIndex: 99991, position: "fixed", top: 60, left: 0, right: 0, bottom: 0 }),
        animate('250ms  ease-in', style({ opacity: 1 })),
      ]),
      transition('* => void', [
        style({ opacity: 1, zIndex: 99999, position: "fixed", top: 60, left: 0, right: 0, bottom: 0 }),
        animate('250ms  ease-out', style({ opacity: 0 }))
      ])
    ])
  }

  public static verticalheight(queryValue: string) {
    return trigger("verticalheight", [
      transition(':enter', [
        query(queryValue, [
          style({ opacity: 0, height: 0, padding: 0 }),
          animate('250ms  ease-out', style({ padding: "*", height: "*", opacity: 1 })),
        ], { optional: true }),
      ]),
      transition(':leave', [
        query(queryValue, [
          animate('250ms  ease-in', style({ height: 0, padding: 0, opacity: 0 }))
        ], { optional: true })
      ])
    ])
  }

  public static connected() { //, primaryColor: string, warnColor: string, defaultColor: string) {
    return trigger("connected", [
      state('Connected',
        style({
          color: '{{primary}}'
        }), { params: { primary: '$primary' } }),
      state('Disconnecting',
        style({
          color: '{{warn}}',
          opacity: 0.6,
        }), { params: { warn: '$warn' } }),
      state('Disconnected',
        style({
          color: '{{default}}'
        }), { params: { default: '$background-accent' } }),
      state('',
        style({
          color: '{{default}}'
        }), { params: { default: '$background-accent' } }),
      state('undefined',
        style({
          color: '{{default}}'
        }), { params: { default: '$background-accent' } }),
      transition('* <=> *', animate('1000ms ease-out')),
    ])
  }


}
