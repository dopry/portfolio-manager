import { IAudit } from "./IAudit";


export interface IMeterDelivery {
  id: number;
  deliveryDate: Date;
  quantity: number;
  audit: IAudit;
}
