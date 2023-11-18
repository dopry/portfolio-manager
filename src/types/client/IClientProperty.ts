import { IProperty } from "../xml/index.js";

export interface IClientProperty extends IProperty {
  // add ID property not returned by API
  id: number;
}
