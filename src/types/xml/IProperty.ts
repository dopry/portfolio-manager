import { AddressCountry } from "./AddressCountry";
import { Agency } from "./Agency";
import { ConstructionStatus } from "./ConstructionStatus";
import { GrossFloorArea } from "./GrossFloorArea";
import { IAddress } from "./IAddress";
import { IAudit } from "./IAudit";
import { IrrigationArea } from "./IrrigationArea";
import { Occupancy } from "./Occupancy";
import { PrimaryFunction } from "./PrimaryFunction";
import { ShareLevel } from "./ShareLevel";

export interface IProperty {
    name: string; // The name of the property. 1-80 characters
    constructionStatus: ConstructionStatus; // The construction status (either existing, design or test project).
    primaryFunction: PrimaryFunction; // The primary function of the building.
    grossFloorArea: GrossFloorArea; // The Gross Floor Area
    irrigatedArea?: IrrigationArea; // The irrigated area
    yearBuilt: number; // The year the property was built
    address: IAddress
    numberOfBuildings?: number; // The estimated number of buildings for this property.
    isFederalProperty: boolean; // Whether the property is a federal property.
    federalOwner?: AddressCountry; //The property physical address - country.
    agency?: Agency; // The federal agency that owns or operates the building.
    agencyDepartmentRegion?: string; // 1-200 chars, Optional additional information about the federal department or region.
    federalCampus?: string; // 1-200 chars, Name of the Federal Campus
    occupancyPercentage: Occupancy // The percentage occupancy of the property.
    notes?: string // >=1 chars, notes about this property. 
    isInstitutionalProperty?: boolean; // Whether the property is a institutional property.
    accessLevel?: ShareLevel; //Current share level for the user calling the webservice.
    audit?: IAudit;
}