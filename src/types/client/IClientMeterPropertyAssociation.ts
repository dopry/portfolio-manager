import { IPropertyRepresentation } from "../xml";

export interface IClientMeterAssociation {
    meters: number[];
    propertyRepresentation: IPropertyRepresentation;
}

export interface IClientMeterPropertyAssociation {
    propertyId: number;
    energyMeterAssociation?: IClientMeterAssociation 
    waterMeterAssociation?: IClientMeterAssociation
    wasteMeterAssociation?: IClientMeterAssociation
 }