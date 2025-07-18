/**
 * @file
 * @module Types.Client
 * Simplified client-facing interfaces for customer management.
 */

/**
 * Represents a customer in a simplified, flattened format.
 */
export interface ICustomer {
  id: number; // The unique ID for the customer.
  organizationName: string; // The name of the customer's organization.
} 
