import { Injectable, EventEmitter } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { LangService } from '../shared/lang.service'
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { ComponentPipeService } from "../shared/component.pipe.service";
import { saveAs as importedSaveAs } from "file-saver";
import { map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvokerService {

  public invokers: Array<DTOInvokerInfo>;
  public Any_Error: EventEmitter<any> = new EventEmitter<any>();
  public isActive = true;
  public isInitialized = false;

  constructor(
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService,
    private rs: LangService,
    private cookieService: CookieService,
    private pipeMessageCompoenent: ComponentPipeService
  ) {
    console.debug("InvokerService.constructor");
  }

  init(deviceId: number, userContractId: number): Observable<DTOInvokerInfo[]> {
    console.debug("InvokerService.init()");

    return this.list(deviceId, userContractId);
  }

  list(deviceId: number, userContractId: number): Observable<DTOInvokerInfo[]> {
    ///Sending history commands to server
    if (!this.invokers) {
      console.debug("InvokerService.list()");

      const deviceDTO = { id: deviceId, userContractId: userContractId };
      const body = JSON.stringify(deviceDTO);
      return this.httpAuth.post<DTOInvokerInfo[]>("api/plugin/commands/invokers", body).pipe(map(
        (rsp) => {
          if (rsp) {
            this.isInitialized = true;
            this.invokers = rsp;

            if (this.invokers.length == 0) {
              throw { message: this.rs.Resource("WarnNoCommands"), type: "warning" };
            }
            return this.invokers;
          }
        }
      ));
    }
    else {
      return Observable.create(observer => { observer.next(this.invokers) });
    }

  }

  invokeCommand(command: string, deviceId: number, userContractId: number) {
    ///Sending history commands to server
    try {
      console.log("InvokerService.invoke");

      if (!this.invokers) {
        throw `Write "#c" to load invokers`;
      }

      const splittedCommand = command.split(/\s+/);
      const invokerAlias = splittedCommand[0].split(/:/)[1];
      const methodAlias = splittedCommand[1];

      const invoker = this.invokers.find(o => o.alias == invokerAlias);

      if (!invoker) {
        throw this.rs.Resource("WarnInvalidInput") + `(${invokerAlias})`;
      }

      const method = invoker.methods.find(o => o.alias == methodAlias);
      if (!methodAlias) {
        throw `Write "#c ${invokerAlias}" for help`;
      }

      if (!method) {
        throw this.rs.Resource("WarnInvalidInput") + `(${methodAlias})`;
      }

      const params = new Array<InvokerMethodParamValueDTO>();

      if (splittedCommand.length > 2) {
        //Changing to Json Serialization
        let argument = splittedCommand.slice(2).join(' ');
        argument = argument.replace(/ *= */gi, "\":\"");// =  by ":"
        argument = argument.trim();
        argument = argument.replace(/ +/gi, "\",\"");//spaces by comma
        argument = argument.replace(/\"\(/gi, "{\""); // "( by { , ej: param = (param = value) => "param" : {"param":"value"} 
        argument = argument.replace(/\)\"/gi, "\"}");// )" by } ,   ej: param = (param = value) => "param" : {"param":"value"} 
        argument = `{"${argument}"}`;///Add braces

        try {
          console.log("InvokerServicer.Invoker() try parse: " + argument);
          JSON.parse(argument);
        }
        catch (any) {
          throw this.rs.Resource("WarnInvalidInput") + ", Press #c for help.";
        }

        const param = new InvokerMethodParamValueDTO(null, argument);
        params.push(param)
      }

      const invokerMethodParam = new InvokerMethodParamDTO(
        invoker.id,
        invoker.interfaceType,
        method.name,
        params,
        deviceId,
        userContractId
      );

      return this.invoke(invokerMethodParam);

    } catch (msg) {
      return throwError(msg);
    }
  }

  invokes(invokerMethodParam: InvokerMethodParamDTO[]): Observable<InvokerMethodResponse[]> {
    console.debug("Invoker.Service.Invokes()");
    const body = `{ "deviceId": ${invokerMethodParam[0].deviceId}, "invokers" : ${JSON.stringify(invokerMethodParam)}, "userContractId":  ${invokerMethodParam[0].userContractId} }`;

    return this.httpAuth.post<InvokerMethodResponse[]>("/api/device/device/invokes", body).pipe(
      map(r => {
        const methodResponses = r;
        if (methodResponses) {
          const invokerMethodResponseDTO = new Array<InvokerMethodResponse>();
          for (const methodResponse of methodResponses) {
            const invokerResponse = this.handleInvokeResponse(methodResponse);
            invokerMethodResponseDTO.push(invokerResponse);
          }
          return invokerMethodResponseDTO;
        }
        else {
          return null;
        }
      }));
  }

  invoke(invokerMethodParam: InvokerMethodParamDTO): any {
    const body = `${JSON.stringify(invokerMethodParam)}`;

    return this.httpAuth.post<InvokerMethodResponseDTO>("/api/device/device/invoke", body).pipe(
      map(r => {
        const methodResponse = r;
        if (methodResponse) {
          return this.handleInvokeResponse(methodResponse);
        }
        else {
          return null;
        }
      }));
  }

  handleInvokeResponse(methodResponse: any): InvokerMethodResponse {
    if (this.isArrayOfString(methodResponse.type)) {
      return new InvokerMethodResponse(
        InvokerMethodResponseType.ArrayOfString,
        JSON.parse(methodResponse.serializedData) as Array<string>
      );
    }
    else if (this.isString(methodResponse.type)) {
      return new InvokerMethodResponse(
        InvokerMethodResponseType.String,
        methodResponse.serializedData
      );
    }
    else if (this.isFile(methodResponse.type)) {
      return new InvokerMethodResponse(
        InvokerMethodResponseType.File,
        JSON.parse(methodResponse.serializedData)
      );
    }
    else if (this.isException(methodResponse.type)) {
      return new InvokerMethodResponse(
        InvokerMethodResponseType.Exception,
        JSON.parse(methodResponse.serializedData) as string
      );
    }
  }

  downloadFile(data: any) {
    var binArray = new Uint8Array(data.File);

    var blob = new Blob([binArray], { type: data.ContextType });
    importedSaveAs(blob, data.FileName);
  }

  isArrayOfString(type: TypeDTO): boolean {
    return type.isArray && new RegExp("string", "gi").test(type.name);
  }

  isString(type: TypeDTO): boolean {
    return new RegExp("string", "gi").test(type.name);
  }

  isException(type: TypeDTO): boolean {
    return new RegExp("invokerexception", "gi").test(type.name);
  }

  isFile(type: TypeDTO): boolean {
    return new RegExp("InvokerMethodReturnFile", "gi").test(type.name);
  }
}

export enum InvokerMethodResponseType {
  String, ArrayOfString, File, Exception
}

///Invokers DTO
export class DTOInvokerInfo {
  constructor(
    public interfaceType: string,
    public methods: DTOInvokerMethodInfo[],
    public help: string,
    public alias: string,
    public order: number,
    public os: string,
    public id: string,
  ) { }
}

export class DTOInvokerMethodInfo {
  constructor(
    //public methodInfo: MethodInfoDTO,
    public parameterInfoes: ParameterInfoDTO[] = null,
    public help: string,
    public alias: string,
    public order: number,
    public name: string,
  ) { }
}

export class MethodInfoDTO {
  constructor(
    public returnType: string,
    public name: string,
    public parameterInfoes: ParameterInfoDTO[]) { }
}

export class ParameterInfoDTO {
  constructor(
    public type: TypeDTO,
    public name: string,
    public alias: string,
    public maxLength: number,
    public minLength: number,
    public order: number,
    public regexValidation: number,
    public propertiesInfoes: ParameterInfoDTO[] = null
  ) { }
}

export class InvokerMethodParamDTO {
  constructor(
    public invokerId: string,
    public interface_: string,
    public method: string,
    public params: InvokerMethodParamValueDTO[],
    public deviceId: number,
    public userContractId: number
  ) { }
}

export class InvokerMethodParamValueDTO {
  constructor(
    public type: TypeDTO,
    public SerializedData: string
  ) { }
}

export class InvokerMethodResponseDTO {
  constructor(
    public type: TypeDTO,
    public serializedData: string,
  ) { };
}

export class InvokerMethodResponse {
  constructor(
    public methodResponseType: InvokerMethodResponseType,
    public data: any
  ) {

  }
}

export class TypeDTO {


  constructor(
    public name: string,
    public isArray: boolean,
    public isClass: boolean
  ) { }
}

export class InvokerMethodExceptionDTO {
  constructor(
    public message: string,
    public invokerExceptionType: number
  ) {
  }
}

///END Invokers DTO
