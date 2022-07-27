import { IrrigationAreaUnits } from "./IrrigationAreaUnits";


export interface IrrigationAreaBase {
    default?: boolean; // Specifies whether to use the default value for Irrigated Area. Only applicable for Multi-Family Housing.
    units: IrrigationAreaUnits; // The units of the Irrigated Area (Square Foot, Square Meter, or Acres).
}
