import { IAccount, IResponse } from "../xml";
import { IParsedXml } from "./IParsedXML";

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

export interface IAccountAccountPostResponse extends IParsedXml {
  response: IResponse;
}
