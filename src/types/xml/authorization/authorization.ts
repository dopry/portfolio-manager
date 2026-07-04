/**
 * @file
 * @module Types.XML.Authorization
 *
 * This file contains interfaces for the request/response bodies used in the
 * Connection & Sharing web services, based on authorization.xsd.
 */

export type AcceptRejectAction = "Accept" | "Reject";

/**
 * The XML payload for accepting or rejecting connection/share requests.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/connect/post
 */
export interface ISharingResponsePayload {
  sharingResponse: {
    action: AcceptRejectAction; // The action you want to take in response to the request (either Accept or Reject).
    note?: string; // The optional note that you can include with your accept/reject response. Max 1000 characters.
  };
}

/**
 * The XML payload for disconnecting from an account or unsharing a property/meter.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/disconnect/post
 */
export interface ITerminateSharingResponsePayload {
  terminateSharingResponse: {
    note?: string; // The optional note that you can include with your termination request. Max 1000 characters.
  };
}

// xml: notification type code
export type NotificationTypeCode = "UNSHARE" | "SHAREUPDATE" | "DISCONNECT" | "TRANSFERPROPERTY";

/**
 * Represents a single notification event from the ESPM system.
 */
export interface INotification {
    notificationTypeCode: NotificationTypeCode; // The notification type code of the notification.
    notificationId: number; // The id number of the notification.
    description: string; // The description of the notification.
    accountId?: number; // The id number of the account to the corresponding notification.
    username: string; // The username of the Portfolio Manager Account to the corresponding notification.
    propertyId?: number; // The id number of the property to the corresponding notification.
    meterId?: number; // The id number of the meter to the corresponding notification.
    notificationCreatedDate?: string; // The date the notification was created.
    notificationCreatedBy?: string; // The account name of the user who created the corresponding notification.
    notificationCreatedByAccountId?: number; // The account id of the user who created the corresponding notification.
}

/**
 * Represents the root element of a GET /notification/list response.
 * @see https://portfoliomanager.energystar.gov/webservices/home/api/connection/notificationList/get
 */
export interface INotificationList {
    notification: INotification[];
}