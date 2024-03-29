import { IProperty, IResponse, PropertyMetrics } from "../xml/index.js";
import { IParsedXml } from "./IParsedXML.js";

export interface IPropertyPropertyGetResponse extends IParsedXml {
  property: IProperty;
}

export interface IPropertyPropertyPostResponse extends IParsedXml {
  response: IResponse;
}

export interface IPropertyPropertyListGetResponse extends IParsedXml {
  response: IResponse;
}

export interface IPropertyDesignMetricsGetResponse extends IParsedXml {
  // TODO: improve typings on returned data.
  propertyMetrics: PropertyMetrics;
}

export interface IPropertyMetricsGetResponse extends IParsedXml {
  // TODO: improve typings on returned data.
  propertyMetrics: PropertyMetrics;
}

export interface IPropertyMetricsMonthlyGetResponse extends IParsedXml {
  // TODO: improve typings on returned data.
  propertyMetrics: PropertyMetrics;
}

export interface ICreateSamplePropertiesPostResponse extends IParsedXml {
  response: IResponse;
}
