export interface ILink {
  "@_hint"?: string; // The hint of the link.
  "@_httpMethod": "GET" | "POST" | "PUT" | "DELETE";
  "@_id"?: string;
  "@_link": string;
  "@_linkDescription": string;
}
