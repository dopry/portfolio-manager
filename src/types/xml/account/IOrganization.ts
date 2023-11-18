import { EnergyStarPartnerType } from "./EnergyStarPartnerType.js";
import { PrimaryBusiness } from "./PrimaryBusiness.js";

export interface IOrganization {
  primaryBusiness: PrimaryBusiness;
  otherBusinessDescription?: string; // max 1000 characters
  energyStarPartner: boolean; // Whether organization is an ENERGY STAR SPP Partner.
  energyStarPartnerType?: EnergyStarPartnerType; // If energyStarPartner is true, this field is required.
  otherPartnerDescription?: string; // max 100 characters, Describes other if you chose other as your energy star partner.
  "@_name": string; // max 1000 characters, organization name
}
