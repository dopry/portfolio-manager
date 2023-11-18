import { IContact } from "./IContact.js";
import { IOrganization } from "./IOrganization.js";

export type LanguagePreference = "en_US" | "fr_CA" | "es_US";

export interface IAccount {
  id: number; // The ID to the account.  This is ignored if specified in a XML request.  This is provided by Portfolio Manager only in a XML response.
  username: string; // Your username. 1-60 characters
  password: string; // Your password.  The password must be at least 8 characters in length and must contain 3 out of  4 of the following requirements: (i) uppercase characters, (ii) lowercase characters, (iii) base 10 digits (0 through 9), and (iv) nonalphanumeric characters: ~!@#$%^&amp;*_-+=`|\(){}[]:;"'&lt;&gt;,.?/
  contact: IContact; // The contact information for the account.
  organization: IOrganization; // The organization information for the account.
  webserviceUser: boolean; // Whether you will be using web services.
  searchable: boolean; // Whether you want people to be able to search for you.
  includeTestPropertiesInGraphics: boolean; // Indicates whether properties marked as “Test Properties” in the account will be included in the charts and graphs on My Portfolio page.
  emailPreferenceCanadianAccount?: boolean; // This setting ONLY applies to accounts belonging to Canada.  NRCAN (Natural Resources of Canada) can contact you with training opportunities, tool updates, program news and other information about the ENERGY STAR program.
  billboardMetric?: string; // Your saved billboard metric
  languagePreference: LanguagePreference;
}
