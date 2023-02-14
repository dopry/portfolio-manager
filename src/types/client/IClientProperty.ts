import { IProperty } from "../xml";

export interface IClientProperty extends IProperty {
  // add ID property not returned by API
  id: number;
}
