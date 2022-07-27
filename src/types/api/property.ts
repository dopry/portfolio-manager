import { IProperty, IResponse } from "../xml";
import { IParsedXml } from "./IParsedXML";


export interface IPropertyPropertyGetResponse extends IParsedXml { 
    property: IProperty
}

export interface IPropertyPropertyPostResponse extends IParsedXml { 
    response: IResponse
}

export interface IPropertyPropertyListGetResponse extends IParsedXml { 
    response: IResponse
}