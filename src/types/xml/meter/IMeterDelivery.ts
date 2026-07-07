import { IAudit } from "../common/audit.js";

export interface IMeterDeliveryPost {
  deliveryDate: string | Date;
  quantity: number;
  cost?: number;
  "@_estimatedValue"?: boolean;
}

export interface IMeterDelivery extends IMeterDeliveryPost {
  id: number;
  deliveryDate: Date;
  audit: IAudit;
}

export function isIMeterDelivery(obj: unknown): obj is IMeterDelivery {
  return (
    obj !== undefined &&
    obj !== null &&
    typeof obj === "object" &&
    Object.prototype.hasOwnProperty.call(obj, "id") &&
    Object.prototype.hasOwnProperty.call(obj, "deliveryDate") &&
    Object.prototype.hasOwnProperty.call(obj, "quantity")
  );
}
