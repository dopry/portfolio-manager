/**
 * @file
 * @module Types.XML.Authorization
 *
 * This file contains interfaces for parsing pending connection and share requests
 * from the various /pending/list endpoints.
 */

import { IAudit, ILink, IAddress } from "../../index.js";
import { IMeter } from "../meter/IMeter.js";
import { IProperty } from "../property/property.js";
import { ShareLevel } from "./ShareLevel.js";

// xml: connectionAudit / shareAudit (logType)
export type IConnectionAudit = IAudit;
export type IShareAudit = IAudit;

export interface ICustomField {
    '@_name': string;
    '#text': string | number;
}

export interface ICustomFieldList {
    customField: ICustomField[] | ICustomField;
}

/**
 * Represents the detailed information about a user/account.
 * This structure appears in pending connection requests.
 */
export interface IAccountInfo {
    firstName: string;
    lastName: string;
    address: IAddress;
    email: string;
    organization: string;
    jobTitle: string;
    phone: string;
}

/**
 * Represents a pending account connection request.
 */
export interface IPendingAccount {
    accountId: number; // The id of the Portfolio Manager Account requesting to connect with you.
    username: string; // The username of the Portfolio Manager Account requesting to connect with you.
    customFieldList?: ICustomFieldList; // A list of custom field values provided by the user.
    accountInfo: IAccountInfo; // Detailed contact information for the account.
    connectionAudit?: IConnectionAudit; // Audit information for the connection request.
}

/**
 * Represents a pending property share request.
 */
export interface IPendingProperty {
    propertyId: number; // The ID number of the property being shared.
    customFieldList?: ICustomFieldList; // A list of custom field values provided by the user for this share.
    accessLevel: ShareLevel; // The level of access for the property share request: Read or Read Write.
    accountId: number; // The id of the account requesting the property share.
    username: string; // The username of the Portfolio Manager Account requesting the property share.
    propertyInfo: IProperty; // Detailed information about the property being shared.
    shareAudit?: IShareAudit; // Audit information for the share request.
}

/**
 * Represents a pending meter share request.
 */
export interface IPendingMeter {
    meterId: number; // The id of the meter being shared.
    propertyId: number; // The id of the corresponding property.
    accountId: number; // The id to the account requesting the meter share.
    username: string; // The username of the Portfolio Manager Account requesting the meter share.
    customFieldList?: ICustomFieldList; // A list of custom field values provided by the user for this share.
    accessLevel: ShareLevel; // The level of access for the meter share request: Read or Read Write.
    propertyInfo: IProperty; // Detailed information about the property this meter belongs to.
    meterInfo: IMeter; // Detailed information about the meter being shared.
    shareAudit?: IShareAudit; // Audit information for the share request.
}

/**
 * Represents the root element of a /connect/account/pending/list response.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingAccountList/get
 */
export interface IPendingAccountList {
    account: IPendingAccount[];
    links?: { link: ILink[] };
}

/**
 * Represents the root element of a /share/property/pending/list response.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingPropertyList/get
 */
export interface IPendingPropertyList {
    property: IPendingProperty[];
    links?: { link: ILink[] };
}

/**
 * Represents the root element of a /share/meter/pending/list response.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingMeterList/get
 */
export interface IPendingMeterList {
    meter: IPendingMeter[];
    links?: { link: ILink[] };
}