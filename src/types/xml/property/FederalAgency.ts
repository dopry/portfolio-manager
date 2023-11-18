import { AddressCountry } from "../common/index.js";

// XML: property/federalAgency.xsd: AgencyType
export interface Agency {
  id: number; // The ID created within Portfolio Manager that uniquely defines the federal agency.
  code?: string; // The federal agency code or abbreviation.
  name?: string; // The federal agency name.
  country: AddressCountry; // The country which owns this agency.
}

export type FederalAgencies = Agency[];
