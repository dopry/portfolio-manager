import { IrrigationAreaBase } from "./IrrigationAreaBase";


export interface IrrigationArea extends IrrigationAreaBase {
    value: number | ""; // The value of the Irrigated Area.
}
