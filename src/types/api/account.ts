import {
  IAccount,
  IResponse,
  IPendingAccountList,
  INotificationList,
} from "../xml/index.js";
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

/**
 * The response structure for a pending connections list request.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingAccountList/get
 */
export interface IGetPendingConnectionsResponse extends IParsedXml {
  pendingList: IPendingAccountList;
}

/**
 * The response structure for a notification list request.
 * Note: Notifications can relate to accounts, properties, or meters, but the
 * endpoint itself is global, so it is homed here.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/notificationList/get
 */
export interface IGetNotificationListResponse extends IParsedXml {
  notificationList: INotificationList;
}

/**
 * A generic response structure for actions that return a standard status response,
 * such as accepting/rejecting/terminating shares and connections. This will be
 * used across account, property, and meter sharing actions.
 */
export interface ISharingActionResponse extends IParsedXml {
  response: IResponse;
}

/**
 * The response structure for a customer list request.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/customer/list
 */
export interface IGetCustomerListResponse extends IParsedXml {
  response: IResponse;
}
