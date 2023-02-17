import { IMeter, IMeterData, IMeterPropertyAssociationList, IResponse } from "../xml";
import { IParsedXml } from "./IParsedXML";


export interface IMeterConsumptionDataGetResponse extends IParsedXml {
    meterData: IMeterData
}

export interface IMeterMeterGetResponse extends IParsedXml {
    meter: IMeter;
}

export interface IMeterMeterPostResponse extends IParsedXml {
    response: IResponse
}

export interface IMeterMeterListGetResponse extends IParsedXml {
    response: IResponse
}

export interface IMeterPropertyAssociationGetResponse extends IParsedXml {
    meterPropertyAssociationList: IMeterPropertyAssociationList;
  }

export interface IMeterPropertyAssociationPostResponse extends IParsedXml {
    response: IResponse;
}
