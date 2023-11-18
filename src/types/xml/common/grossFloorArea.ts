import { UseAttributeBase } from "../propertyUse/index.js";

export type GrossFloorAreaUnits = "Square Feet" | "Square Meters";

export interface FloorAreaTypeBase extends UseAttributeBase {
  "@_units": GrossFloorAreaUnits;
}

export interface GrossFloorArea extends FloorAreaTypeBase {
  value: number; // The value of the characteristic.
}

export interface OptionalFloorArea extends FloorAreaTypeBase {
  value?: number; // The value of the characteristic.
}
