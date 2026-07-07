// xml: logType
// Account ids are xs:long in the schema and parse as numbers at runtime;
// all fields are minOccurs="0". Both were previously mistyped (required
// strings) — caught by the generated-type drift check.
export interface IAudit {
  createdBy?: string;
  createdByAccountId?: number;
  createdDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedByAccountId?: number;
  lastUpdatedDate?: string;
}
