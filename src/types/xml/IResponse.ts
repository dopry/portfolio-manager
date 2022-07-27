import { ILink } from "./ILink";

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
  return (
    obj &&
    obj.hasOwnProperty("links") &&
    obj.links.hasOwnProperty("link") &&
    Array.isArray(obj.links.link)
  );
}

export interface IResponse {
  id: number;
  links: { link: ILink[] };
  errors?: IError[];
  warnings?: IWarning[];
  "@_status": Status;
}
