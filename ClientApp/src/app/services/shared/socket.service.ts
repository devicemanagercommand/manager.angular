import { EventEmitter, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  connectionEstablished = new EventEmitter<boolean>();

  public connectionIsEstablished = false;
  private connection: HubConnection;

  constructor() {
    this.createConnection();
  }

  private createConnection() {
    const m = 1000;
    this.connection = new HubConnectionBuilder()
      .withUrl("devicehub",
        {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        }
      )
      .withAutomaticReconnect([2 * m, 3 * m, 5 * m, 8 * m, 13 * m, 24 * m, 32 * m])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.onClose(async (error: Error) => {
      console.debug("SocketService.connection.onclose()", error);
      await this.startConnection();
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  public async startConnection(): Promise<void> {
    this.connectionIsEstablished = false;
    if (this.connection.state === HubConnectionState.Connected) {
      this.connectionIsEstablished = true;
      this.connectionEstablished.emit(true);
    }
    else {
      while (!this.connectionIsEstablished) {
        try {
          await this.connection.start()
          this.connectionIsEstablished = true;
          console.debug('Hub connection started');
          this.connectionEstablished.emit(true);
        } catch (err) {
          console.error('Error while establishing connection, retrying...', err);
          await this.delay(5000);
        }
      }
    }
  }

  send(method: string, object: any): void {
    if (this.connection) {
      this.connection.invoke(method, object);
    }
  }

  joinGroup(group: string): void {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      this.connection.invoke('JoinGroup', group);
    }
    else {
      console.error("Cannot connect hub when call JoinGroup");
    }
  }

  disconnectGroup(group: string): void {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      this.connection.invoke('DisconnectGroup', group);
    }
    else {
      console.error("Cannot connect hub when call JoinGroup");
    }
  }

  receive<T>(method: string, func: (data: T) => void) {
    this.connection.on(method, (data: T) => {
      func(data);
    });
  }

  onReconnected(func: () => void) {
    this.connection.onreconnected(() => {
      console.debug("SocketService.connection.onreconnected()");
      func();
    });
  }

  onReconnecting(func: () => void) {
    this.connection.onreconnecting(() => {
      console.debug("SocketService.connection.onreconnecting()");
      func();
    });
  }


  public onClose(func: (error: Error) => void) {
    this.connection.onclose(func);
  }


}
