import { IAudit } from "../common/audit.js";

export interface IMeterDelivery {
  id: number;
  deliveryDate: Date;
  quantity: number;
  cost?: number;
  "@_estimatedValue"?: boolean;
  audit: IAudit;
}

export function isIMeterDelivery(obj: unknown): obj is IMeterDelivery {
  return (
    obj !== undefined &&
    obj !== null &&
    typeof obj === "object" &&
    obj.hasOwnProperty("id") &&
    obj.hasOwnProperty("deliveryDate") &&
    obj.hasOwnProperty("quantity")
  );
}
