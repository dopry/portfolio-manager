import type { IProperty } from "../types/xml/index.js";

export type EditableProperty = Omit<IProperty, "id" | "accessLevel" | "audit">;

export function toEditableProperty(property: IProperty): EditableProperty {
  const {
    id: _id,
    accessLevel: _accessLevel,
    audit: _audit,
    ...editable
  } = property;
  return editable;
}
