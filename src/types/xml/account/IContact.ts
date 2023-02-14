import { IAddress } from "../common";

export interface IContact {
  firstName: string; // max 100 characters
  lastName: string; // max 100 characters
  email: string; // max 100 characters
  address: IAddress;
  jobTitle: string; // max 100 characters
  phone: string; // max 30 characters
}
