/**
 * @file
 * @module Types.Client
 * Simplified client-facing interfaces for share management.
 */

import { ShareLevel } from "../xml/index.js";

/**
 * Represents a pending property or meter share request in a simplified, flattened format.
 */
export interface IClientPendingShareRequest {
  type: "property" | "meter"; // The type of entity being shared.
  id: number; // The ID of the entity being shared (propertyId or meterId).
  propertyId: number; // The ID of the property to which the shared entity belongs.
  propertyName: string; // The name of the property to which the shared entity belongs.
  sharerUsername: string; // The username of the account that initiated the share request.
  sharerAccountId: number; // The account ID of the user that initiated the share request.
  accessLevel: ShareLevel; // The requested access level ('Read' or 'Read Write').
  requestedDate: string; // The date the share request was created.
  customFields?: Record<string, string | number>; // A key-value map of any custom fields submitted with the request.
}
