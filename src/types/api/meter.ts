import {
  IMeter,
  IMeterData,
  IMeterPropertyAssociationList,
  IResponse,
} from "../xml/index.js";
import {
  IAdditionalIdentifier,
  IAdditionalIdentifierTypes,
  IAdditionalIdentifiers
} from "../xml/property/AdditionalIdentifier.js";
import { IParsedXml } from "./IParsedXML.js";

export interface IMeterConsumptionDataGetResponse extends IParsedXml {
  meterData: IMeterData;
}

export interface IMeterConsumptionDataPutResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterIdentifierGetResponse extends IParsedXml {
  additionalIdentifier: IAdditionalIdentifier;
}

export interface IMeterIdentifierPostResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterIdentifierPutResponse extends IParsedXml {
  response: IResponse;
}

export interface IMeterIdentifierListGetResponse extends IParsedXml {
  additionalIdentifiers: IAdditionalIdentifiers;
}

export interface IMeterIdentifierTypesListGetResponse extends IParsedXml {
  additionalIdentifierTypes: IAdditionalIdentifierTypes;
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
