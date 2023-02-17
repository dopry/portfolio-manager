export type IrrigationAreaUnits =
  | "Square Feet"
  | "Square Meters"
  | "Acres"
  | "";

export interface IrrigationAreaBase {
  default?: boolean; // Specifies whether to use the default value for Irrigated Area. Only applicable for Multi-Family Housing.
  units: IrrigationAreaUnits; // The units of the Irrigated Area (Square Foot, Square Meter, or Acres).
}

export interface IrrigationArea extends IrrigationAreaBase {
  value: number | ""; // The value of the Irrigated Area.
}
