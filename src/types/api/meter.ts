import {
  IMeter,
  IMeterData,
  IMeterPropertyAssociationList,
  IResponse,
} from "../xml";
import { IAdditionalIdentifiers } from "../xml/property/AdditionalIdentifier";
import { IParsedXml } from "./IParsedXML";

export interface IMeterConsumptionDataGetResponse extends IParsedXml {
  meterData: IMeterData;
}

export interface IMeterConsumptionDataPutResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterIdentifierListGetResponse extends IParsedXml {
    additionalIdentifiers: IAdditionalIdentifiers;
}
export interface IMeterMeterGetResponse extends IParsedXml {
  meter: IMeter;
}

export interface IMeterMeterPostResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterMeterListGetResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterPropertyAssociationGetResponse extends IParsedXml {
  meterPropertyAssociationList: IMeterPropertyAssociationList;
}

export interface IMeterPropertyAssociationPostResponse extends IParsedXml {
  response: IResponse;
}
