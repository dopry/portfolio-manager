import {
  IAddress,
  IMeter,
  IProperty,
  MeterUnitsOfMeasure,
  TypeOfMeter
} from "./types/index.js";

export function stamp() {
  return (
    new Date()
      .toISOString()
      // @ts-ignore
      .replaceAll(":", "_")
      .replaceAll(".", "_")
  );
}

export function mockIAddress(): IAddress {
  return {
    "@_address1": "123 Main St",
    "@_city": "Test",
    "@_postalCode": "1234567",
    "@_country": "US",
    "@_state": "NY",
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
