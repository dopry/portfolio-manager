import { ILink } from "../common/links.js";

export interface IError {
  errorNumber: string; // The number of the error.
  errorDescription: string; // The description of the error.
}

export type Errors = IError[];

export interface IWarning {
  warningNumber: string; // The number of the error.
  warningDescription: string; // The description of the error.
}

export type Warnings = IError[];

export type Status = "Ok" | "Error";

export function isIResponse(obj: any): obj is IResponse {
  return isIEmptyResponse(obj) || isIPopulatedResponse(obj);
}

export function isIPopulatedResponse(obj: any): obj is IPopoulatedResponse {
  return (
    obj &&
    obj.hasOwnProperty("links") &&
    typeof obj.links === "object" &&
    obj.links.hasOwnProperty("link") &&
    Array.isArray(obj.links.link)
  );
}

export function isIEmptyResponse(obj: any): obj is IEmptyResponse {
  return obj && obj.hasOwnProperty("links") && typeof obj.links === "string";
}

export interface IResponse {
  id?: number;
  // when fast-xml-parse encounters and empty node it returns an empty string.
  // empty strings have a deprecated .link method, so we cannot test if
  // reponses.links.link to see if the valus is populated. It will always be true.
  // so we need to allow for that. I have an open issue with the library author to allow
  // overriding value of self closing tag with the tagValueProcessor so we can override this.
  // see: https://github.com/NaturalIntelligence/fast-xml-parser/issues/544
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/link
  links: { link: ILink[] } | string;
  errors?: IError[];
  warnings?: IWarning[];
  "@_status": Status;
}

export interface IEmptyResponse extends IResponse {
  id: undefined;
  links: string;
}

export interface IPopoulatedResponse extends IResponse {
  id: number;
  links: { link: ILink[] };
}
