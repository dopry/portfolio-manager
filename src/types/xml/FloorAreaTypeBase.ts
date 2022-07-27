import { GrossFloorAreaUnits } from "./GrossFloorAreaUnits";
import { UseAttributeBase } from "./UseAttributeBase";


export interface FloorAreaTypeBase extends UseAttributeBase {
    "@_units": GrossFloorAreaUnits;
}
