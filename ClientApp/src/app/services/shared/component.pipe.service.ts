import { Injectable, Inject, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class ComponentPipeService {

  //https://angular.io/api/core/EventEmitter
  public listenMessage: EventEmitter<PipeMessage> = new EventEmitter();

  constructor(private http: HttpClient) {
    console.log("ComponentPipe.Service.constructor");
  }

  public SendMessage(event: PipeMessage) {
    console.log("ComponentPipe.Service.SendMessage()");
    this.listenMessage.emit(event);
  }
}

export class PipeMessage {

  constructor(
    public fromComponent: any,
    public toComponent: any,
    public message: string
  ) { }
}
