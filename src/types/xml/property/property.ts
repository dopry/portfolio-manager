import { ShareLevel } from "../authorization/index.js";
import {
  AddressCountry,
  GrossFloorArea,
  IAddress,
  IAudit,
  IrrigationArea,
} from "../common/index.js";
import { Agency } from "./FederalAgency.js";

// xml: constructionStatusType
export type ConstructionStatus = "Existing" | "Project" | "Test";

// xml: OccupancyType
export type Occupancy =
  | 0
  | 5
  | 10
  | 15
  | 20
  | 25
  | 30
  | 35
  | 40
  | 45
  | 50
  | 55
  | 60
  | 65
  | 70
  | 75
  | 80
  | 85
  | 90
  | 95
  | 100;

// xml: primaryFunctionType
export type PrimaryFunction =
  | "Adult Education"
  | "Ambulatory Surgical Center"
  | "Aquarium"
  | "Automobile Dealership"
  | "Bank Branch"
  | "Bar/Nightclub"
  | "Barracks"
  | "Bowling Alley"
  | "Casino"
  | "College/University"
  | "Convenience Store with Gas Station"
  | "Convenience Store without Gas Station"
  | "Convention Center"
  | "Courthouse"
  | "Data Center"
  | "Distribution Center"
  | "Drinking Water Treatment &amp; Distribution"
  | "Enclosed Mall"
  | "Energy/Power Station"
  | "Fast Food Restaurant"
  | "Financial Office"
  | "Fire Station"
  | "Fitness Center/Health Club/Gym"
  | "Food Sales"
  | "Food Service"
  | "Hospital (General Medical &amp; Surgical"
  | "Hotel"
  | "Ice/Curling Rink"
  | "Indoor Arena"
  | "K-12 School"
  | "Laboratory"
  | "Library"
  | "Lifestyle Center"
  | "Mailing Center/Post Office"
  | "Manufacturing/Industrial Plant"
  | "Medical Office"
  | "Mixed Use Property"
  | "Movie Theater"
  | "Multifamily Housing"
  | "Museum"
  | "Non-Refrigerated Warehouse"
  | "Office"
  | "Other - Education"
  | "Other - Entertainment/Public Assembly"
  | "Other - Lodging/Residential"
  | "Other - Mall"
  | "Other - Public Services"
  | "Other - Recreation"
  | "Other - Restaurant/Bar"
  | "Other - Services"
  | "Other - Stadium"
  | "Other - Technology/Science"
  | "Other - Utility"
  | "Other"
  | "Other/Specialty Hospital"
  | "Outpatient Rehabilitation/Physical Therapy"
  | "Parking"
  | "Performing Arts"
  | "Personal Services (Health/Beauty, Dry Cleaning, etc"
  | "Police Station"
  | "Pre-school/Daycare"
  | "Prison/Incarceration"
  | "Race Track"
  | "Refrigerated Warehouse"
  | "Repair Services (Vehicle, Shoe, Locksmith, etc"
  | "Residence Hall/Dormitory"
  | "Residential Care Facility"
  | "Restaurant"
  | "Retail Store"
  | "Roller Rink"
  | "Self-Storage Facility"
  | "Senior Living Community"
  | "Single Family Home"
  | "Social/Meeting Hall"
  | "Stadium (Closed"
  | "Stadium (Open"
  | "Strip Mall"
  | "Supermarket/Grocery Store"
  | "Swimming Pool"
  | "Transportation Terminal/Station"
  | "Urgent Care/Clinic/Other Outpatient"
  | "Veterinary Office"
  | "Vocational School"
  | "Wastewater Treatment Plant"
  | "Wholesale Club/Supercenter"
  | "Worship Facility"
  | "Zoo";

export interface IProperty {
  id: number; // The ID to the property.  This is ignored if specified in a XML request.  This is provided by Portfolio Manager only in a XML response.
  name: string; // The name of the property. 1-80 characters
  constructionStatus: ConstructionStatus; // The construction status (either existing, design or test project).
  primaryFunction: PrimaryFunction; // The primary function of the building.
  grossFloorArea: GrossFloorArea; // The Gross Floor Area
  irrigatedArea?: IrrigationArea; // The irrigated area
  yearBuilt: number; // The year the property was built
  address: IAddress;
  numberOfBuildings?: number; // The estimated number of buildings for this property.
  isFederalProperty: boolean; // Whether the property is a federal property.
  federalOwner?: AddressCountry; //The property physical address - country.
  agency?: Agency; // The federal agency that owns or operates the building.
  agencyDepartmentRegion?: string; // 1-200 chars, Optional additional information about the federal department or region.
  federalCampus?: string; // 1-200 chars, Name of the Federal Campus
  occupancyPercentage: Occupancy; // The percentage occupancy of the property.
  notes?: string; // >=1 chars, notes about this property.
  isInstitutionalProperty?: boolean; // Whether the property is a institutional property.
  accessLevel?: ShareLevel; //Current share level for the user calling the webservice.
  audit?: IAudit;
}
