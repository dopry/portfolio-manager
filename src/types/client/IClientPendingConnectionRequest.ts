/**
 * @file
 * @module Types.Client
 * Simplified client-facing interfaces for connection management.
 */

/**
 * Represents a pending connection request from another user in a simplified, flattened format.
 */
export interface IClientPendingConnectionRequest {
  accountId: number; // The unique ID for the account requesting connection.
  username: string; // The username of the account requesting connection.
  firstName: string; // The first name of the contact for the requesting account.
  lastName: string; // The last name of the contact for the requesting account.
  email: string; // The email of the contact for the requesting account.
  organization: string; // The organization name for the requesting account.
  requestedDate: string; // The date the connection request was created.
  customFields?: Record<string, string | number>; // A key-value map of any custom fields submitted with the request.
}
