import { AddressCountry } from "./AddressCountry";
import { AddressState } from "./AddressState";


export interface IAddress {
  '@_address1': string; // max length: 100
  '@_address2'?: string; // max length: 100
  '@_city': string; // max length: 100
  '@_county'?: string; // max length: 40
  '@_postalCode': string; // max length: 40
  '@_state'?: AddressState; // either state or otherState must be provided
  '@_otherState'?: string; // max length: 50
  '@_country': AddressCountry;
}
