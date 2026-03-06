import { ILink } from "../types/index.js";

export function parseLinkId(link: ILink): number | undefined {
  const idValue = link["@_id"] || link["@_link"].split("/").pop() || "";
  const parsed = parseInt(idValue, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}
