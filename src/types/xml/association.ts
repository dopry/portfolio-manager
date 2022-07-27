
export interface IMeterPropertyAssociationList {
    energyMeterAssociation?: IEnergyMeterAssociationAndConfig;
    waterMeterAssociation?: IWaterMeterAssociationAndConfig;
    wasteMeterAssociation?: IWasteMeterAssociationAndConfig;
  }
  
  export interface IEnergyMeterAssociationAndConfig {
    meters: IMeterList;
    propertyRepresentation: IPropertyRepresentation;
  }
  
  export interface IWaterMeterAssociationAndConfig
    extends IEnergyMeterAssociationAndConfig {}
  export interface IWasteMeterAssociationAndConfig
    extends IEnergyMeterAssociationAndConfig {}
  
  export type IMeterList = number[];
  
  export type PropertyRepresentationType =
    | "Whole Property" // The energy meters are associated with the whole property.
    | "Common Area Energy Consumption Only" // The energy meters are associated with the common area only.
    | "Tenant Energy Consumption Only" // The energy meters are associated with the tenant area only.
    | "Combination of Tenant and Common Area Consumption" // The energy meters are associated with a combination of the tenant and common areas. If selected, you must specify the energy uses with the "tenantCommonAreaEnergyUseList" XML element.
    | "Other" //The energy meters are not associated with any of the given choices, you are specifiying "Other."
    | "No Selection Made"; //
  
  export type TenantCommonAreaEnergType =
    | "Tenant Heating"
    | "Tenant Cooling"
    | "Tenant Hot Water"
    | "Tenant Plug Load/Electricity"
    | "Common Area Heating"
    | "Common Area Cooling"
    | "Common Area Hot Water"
    | "Common Area Plug Load/Electricity";
  
  export interface ITenantCommonAreaEnergyUseInformation {
    energyUse: TenantCommonAreaEnergType;
  }
  
  // Indication of what energy is covered by the energy meters you associate together for calculations
  export interface IPropertyRepresentation {
    propertyRepresentationType: PropertyRepresentationType; // Indication of what energy is covered by the energy meters you associate together for calculations
    tenantCommonAreaEnergyUseList?: ITenantCommonAreaEnergyUseInformation[]; // Indicates the various energy uses if a "Combination of Tenant and Common Area Consumption" property representation type is selected. This is only required when "Combination of Tenant and Common Area Consumption" is specified. At least one of the 8 options must be selected.
    propertyRepresentationTypeOtherDesc?: string; // If you chose "Other" for the property representation, this is the description.
  }
  