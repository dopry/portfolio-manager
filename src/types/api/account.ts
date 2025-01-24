import { IAccount, IResponse } from "../xml/index.js";
import { IParsedXml } from "./IParsedXML.js";

/**
 * @file
 * @module Account
 * Account Types
 *
 * https://portfoliomanager.energystar.gov/webservices/home/api/account
 *
 */

export interface IAccountAccountGetResponse extends IParsedXml {
  account: IAccount;
}
