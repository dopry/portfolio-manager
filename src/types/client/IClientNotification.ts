/**
 * @file
 * @module Types.Client
 * Simplified client-facing interfaces for notification management.
 */
import { NotificationTypeCode } from "../xml/index.js";

/**
 * Represents a notification from the ESPM system in a simplified, flattened format.
 */
export interface IClientNotification {
  id: number; // The unique ID of the notification.
  type: NotificationTypeCode; // The type of event that triggered the notification.
  date: string; // The date the notification was created.
  description: string; // The system-generated description of the notification event.
  accountId?: number; // The account ID related to the notification event, if applicable.
  propertyId?: number; // The property ID related to the notification event, if applicable.
  meterId?: number; // The meter ID related to the notification event, if applicable.
  createdByUsername?: string; // The username of the user who triggered the notification.
  createdByAccountId?: number; // The account ID of the user who triggered the notification.
}
