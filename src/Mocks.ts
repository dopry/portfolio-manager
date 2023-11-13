import { PortfolioManager } from "./PortfolioManager";
import {
  IAccount,
  IAddress,
  IMeter,
  IOrganization,
  IProperty,
  MeterUnitsOfMeasure,
  TypeOfMeter,
} from "./types";

export function mockIAddress(): IAddress {
  return {
    "@_address1": "123 Main St",
    "@_city": "Test",
    "@_postalCode": "1234567",
    "@_country": "US",
    "@_state": "NY",
  };
}

export function mockIOrganization(): IOrganization {
  return {
    "@_name": "Test",
    primaryBusiness: "Energy Efficiency Program",
    energyStarPartner: true,
    energyStarPartnerType: "Other",
    otherPartnerDescription: "Test Partner Deacription",
  };
}

export function mockIAccount(
  USERNAME: string,
  PASSWORD: string,
  organization = mockIOrganization(),
  address = mockIAddress()
): Omit<IAccount, "id"> {
  return {
    username: USERNAME,
    password: PASSWORD,
    webserviceUser: true,
    searchable: false,
    contact: {
      firstName: "Test",
      lastName: "User",
      email: "" + USERNAME + "@energystar.gov",
      phone: "555-555-5555",
      jobTitle: "Test User",
      address,
    },
    organization,
    includeTestPropertiesInGraphics: false,
    languagePreference: "en_US",
  };
}

export function mockIProperty(): Omit<IProperty, "id"> {
  const address = mockIAddress();
  return {
    isFederalProperty: false,
    occupancyPercentage: 80,
    name: "Test Property",
    constructionStatus: "Test",
    primaryFunction: "Data Center",
    grossFloorArea: {
      value: 8000,
      "@_units": "Square Feet",
    },
    yearBuilt: 2022,
    address,
  };
}

export function mockMeter(
  name = "Test Meter",
  unitOfMeasure: MeterUnitsOfMeasure = "kWh (thousand Watt-hours)",
  type: TypeOfMeter = "Electric",
  firstBillDate = new Date(2019, 0, 1),
  inUse = true
): IMeter {
  return {
    name,
    unitOfMeasure,
    type,
    firstBillDate,
    inUse,
  };
}

export async function ensureTestAccount(
  pm: PortfolioManager,
  username: string,
  password: string
): Promise<IAccount> {
  try {
    return await pm.getAccount();
  } catch (e) {
      const account = mockIAccount(username, password);
      const created = await pm.createAccount(account);
      return created;
  }
}
