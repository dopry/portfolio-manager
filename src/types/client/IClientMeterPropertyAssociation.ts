import { IPropertyRepresentation } from "../xml/index.js";

export interface IClientMeterAssociation {
  meters: number[];
  propertyRepresentation: IPropertyRepresentation;
}

export interface IClientMeterPropertyAssociation {
  propertyId: number;
  energyMeterAssociation?: IClientMeterAssociation;
  waterMeterAssociation?: IClientMeterAssociation;
  wasteMeterAssociation?: IClientMeterAssociation;
}
