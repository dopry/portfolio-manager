import { IAudit } from "./IAudit";

export interface IMeterDelivery {
  id: number;
  deliveryDate: Date;
  quantity: number;
  audit: IAudit;
}

export function isIMeterDelivery(
  meter: IMeterDelivery
): meter is IMeterDelivery {
  return (
    meter.hasOwnProperty("deliveryDate") && meter.hasOwnProperty("quantity")
  );
}
