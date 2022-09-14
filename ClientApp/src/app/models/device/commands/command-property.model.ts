import { CommandPropertyTypeModel } from "./command-property-type.model";
import { CommandMethodModel } from "./command-method.model";

export class CommandPropertyModel {

    public id: number;
    public name: string;
    public value: any;///For binding


    public minLength: number;
    public maxLength: number;



    public commandPropertyTypeId: number;
    public commandPropertyType: CommandPropertyTypeModel;

    //Recursive 
    public parentCommandProperty: CommandPropertyModel;
    public parentCommandPropertyId: number;

    public commandProperties: Array<CommandPropertyModel>;
    public method: CommandMethodModel;
    public regexValidation: string;
    public help: string;

}
