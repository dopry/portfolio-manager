/**
 * Compile-time drift check (phase 2 of plans/xsd-driven-type-generation.md):
 * values typed by the hand-written XML interfaces must remain assignable to
 * their generated schema mirrors. A failure here means either the hand type
 * drifted from the schema or the generator's mapping regressed.
 *
 * Types only — this module emits no runtime code. The curated set below
 * grows as phase 3 migrates each domain onto the generated types.
 */
import type { IAdditionalIdentifier } from "../property/AdditionalIdentifier.js";
import type { IAddress } from "../common/address.js";
import type { IAudit } from "../common/audit.js";
import type { ILink } from "../common/links.js";
import type { IMeter } from "../meter/IMeter.js";
import type {
  AdditionalIdentifiersElement,
  AddressType,
  LinkType,
  LogType,
  MeterType,
} from "./v26.0.js";

type Expect<T extends true> = T;
type IsAssignable<A, B> = A extends B ? true : false;

type _Link = Expect<IsAssignable<ILink, LinkType>>;
type _Address = Expect<IsAssignable<IAddress, AddressType>>;
type _Audit = Expect<IsAssignable<IAudit, LogType>>;

// The hand-written IMeter types date fields as Date for the request side
// (the XML builder serializes them); parsed responses carry strings, which
// is what the generated type models. Normalize the dates, then the rest of
// the shape (enums, optionality) must line up.
type IMeterAsParsed = Omit<IMeter, "firstBillDate" | "inactiveDate"> & {
  firstBillDate: string;
  inactiveDate?: string;
};
type _Meter = Expect<IsAssignable<IMeterAsParsed, MeterType>>;

// additionalIdentifier is declared inline inside the document root, so the
// generated item type is reached through the element interface.
type _AdditionalIdentifier = Expect<
  IsAssignable<
    IAdditionalIdentifier,
    NonNullable<AdditionalIdentifiersElement["additionalIdentifier"]>[number]
  >
>;

export {};
