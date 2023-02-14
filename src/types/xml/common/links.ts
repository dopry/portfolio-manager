
export interface ILink {
  "@_hint"?: string; // The hint of the link.
  "@_httpMethod": "get" | "post" | "put" | "delete";
  "@_id"?: string;
  "@_link": string;
  "@_linkDescription": string;
}
