import { IResponse } from "../xml/index.js";
import { IParsedXml } from "./IParsedXML.js";

/** Cursor values returned by Portfolio Manager are opaque, not page numbers. */
export type WhatChangedPageKey = string;

export interface IWhatChangedOptions {
  nextPageKey?: WhatChangedPageKey;
  previousPageKey?: WhatChangedPageKey;
}

export interface IGetWhatChangedResponse extends IParsedXml {
  response: IResponse;
}
