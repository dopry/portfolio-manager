import {
  XMLParser,
  XMLBuilder,
  XmlBuilderOptions,
  X2jOptions,
} from "fast-xml-parser";
import { IAccount, IMeter, IMeterData, IMeterDataPost, IProperty, toXmlDateString } from "./types/xml";
import fetch from "node-fetch";
import { RequestInit, BodyInit } from "node-fetch";
import {
  IAccountAccountGetResponse,
  IAccountAccountPostResponse,
  IMeterConsumptionDataGetResponse,
  IMeterMeterGetResponse,
  IMeterMeterListGetResponse,
  IMeterMeterPostResponse,
  IMeterPropertyAssociationGetResponse,
  IMeterPropertyAssociationPostResponse,
  IPropertyDesignMetricsGetResponse,
  IPropertyMetricsGetResponse,
  IPropertyMetricsMonthlyGetResponse,
  IPropertyPropertyGetResponse,
  IPropertyPropertyListGetResponse,
  IPropertyPropertyPostResponse,
  MeasurementSystem,
} from "./types";
import { btoa } from "./functions";
import { isNumber, isString } from "type-guards";
import { isDate } from "util/types";
import { deepmerge } from "deepmerge-ts";

/**
 * Gateway to the the Portfolio Manager API.
 * see: https://portfoliomanager.energystar.gov/webservices/home/api
 *
 * This class is a minimimal Gateway to the Portfolio Manager API. It should do little more than
 * provide typed methods for each endpoint and construct the request. It should not be concerned
 * with the response or error handling. If you want a higher level of abstraction, you should use
 * the PortfolioManager Facade instead.
 *
 *
 * Responsbilities:
 * - Typeing API calls
 * - XML Parsing/Building
 * - Methods for each endpoint
 * - Request Construction
 */
export class PortfolioManagerApi {
  xmlParserOptions: Partial<X2jOptions> = {
    ignoreAttributes: false,
    isArray: (name, jpath, isLeafNode, isAttribute): boolean => {
      // ensure response.links.link is always an array even when there
      // is only one link which results in  object by default
      // console.log(jpath);
      return (
        jpath === "response.links.link" ||
        jpath === "propertyMetrics.metric" ||
        jpath === "meterData.links.link" ||
        jpath ===
          "meterPropertyAssociationList.waterMeterAssociation.meters.meterId" ||
        jpath ===
          "meterPropertyAssociationList.energyMeterAssociation.meters.meterId" ||
        jpath ===
          "meterPropertyAssociationList.wasteMeterAssociation.meters.meterId" ||
        jpath === "meterData.meterDelivery" ||
        jpath === "meterData.meterConsumption"
      );
    },
  };
  xmlBuilderOptions: Partial<XmlBuilderOptions> = {
    ignoreAttributes: false,
    tagValueProcessor: (name, value) => {
      switch (name) {
        case "firstBillDate":
          if (isString(value) || isDate(value) || isNumber(value)) {
            const date = new Date(value);
            return toXmlDateString(date);
          }
          return value as string;
        default:
          return value as string;
      }
    },
  };

  constructor(
    private readonly endpoint: string,
    private readonly username: string,
    private readonly password: string
  ) {}

  async fetch<RESP>(path: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/xml",
    };
    // POST /account is the only path that doesn't require auth.
    if (path != "account" || options.method != "POST") {
      headers["Authorization"] =
        "Basic " + btoa(`${this.username}:${this.password}`);
    }
    const defaults = { method: "GET", headers } as RequestInit;
    const init: RequestInit = deepmerge({}, defaults, options);
    const url = this.endpoint + path;
    // console.log('req', { url, init })
    const response = await fetch(url, init);
    const xmlResp = await response.text();
    const parser = new XMLParser(this.xmlParserOptions);
    const parsed = parser.parse(xmlResp) as RESP;
    // console.log("response", {response, xmlResp, parsed});
    return parsed;
  }

  async post<REQ, RESP>(path: string, data: REQ): Promise<RESP> {
    const builder = new XMLBuilder(this.xmlBuilderOptions);
    const xmlData: string = builder.build(data);
    const method = "POST";
    const body: BodyInit = xmlData;
    const init: RequestInit = { method, body };
    return await this.fetch<RESP>(path, init);
  }

  async put<REQ, RESP>(path: string, data: REQ): Promise<RESP> {
    const builder = new XMLBuilder(this.xmlBuilderOptions);
    const xmlData: string = builder.build(data);
    const method = "PUT";
    const body: BodyInit = xmlData;
    const init: RequestInit = { method, body };
    return await this.fetch<RESP>(path, init);
  }

  async get<RESP>(path: string, options: RequestInit = {}): Promise<RESP> {
    return this.fetch<RESP>(path, options);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/account/account/get
  async accountAccountGet(): Promise<IAccountAccountGetResponse> {
    return this.get<IAccountAccountGetResponse>("account");
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/account/account/post
  async accountAccountPost(
    account: IAccount
  ): Promise<IAccountAccountPostResponse> {
    return this.post<{ account: IAccount }, IAccountAccountPostResponse>(
      "account",
      {
        account,
      }
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/meter/get
  async meterMeterGet(meterId: number): Promise<IMeterMeterGetResponse> {
    return this.get<IMeterMeterGetResponse>(`meter/${meterId}`);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/property/get
  async propertyPropertyGet(
    propertyId: number
  ): Promise<IPropertyPropertyGetResponse> {
    return this.get<IPropertyPropertyGetResponse>(`property/${propertyId}`);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/property/post
  async propertyPropertyPost(
    property: IProperty,
    accountId: number
  ): Promise<IPropertyPropertyPostResponse> {
    return this.post<{ property: IProperty }, IPropertyPropertyPostResponse>(
      `account/${accountId}/property`,
      { property }
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/propertyList/get
  async propertyPropertyListGet(
    accountId: number
  ): Promise<IPropertyPropertyListGetResponse> {
    return this.get<IPropertyPropertyListGetResponse>(
      `account/${accountId}/property/list`
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/consumptionData/post
  async meterMeterConsumptionDataPost(
    meterId: number,
    meterConsumption: IMeterDataPost
  ): Promise<IMeterData> {
    return this.post<
      IMeterDataPost,
      IMeterData
    >(`meter/${meterId}/consumptionData`,  meterConsumption);
  }
  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/meter/post
  async meterMeterPost(
    propertyId: number,
    meter: IMeter
  ): Promise<IMeterMeterPostResponse> {
    return this.post<{ meter: IMeter }, IMeterMeterPostResponse>(
      `property/${propertyId}/meter/`,
      { meter }
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/propertyAssociation/get
  async meterPropertyAssociationGet(
    propertyId: number
  ): Promise<IMeterPropertyAssociationGetResponse> {
    return this.get<IMeterPropertyAssociationGetResponse>(
      `/association/property/${propertyId}/meter`
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/propertyAssociation/post
  async meterPropertyAssociationSinglePost(propertyId: number,
    meterId: number): Promise<IMeterPropertyAssociationPostResponse> {
      return this.post<undefined, IMeterPropertyAssociationPostResponse>(`/association/property/${propertyId}/meter/${meterId}`, undefined)
  }


  // https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/meterList/get
  async meterMeterListGet(
    propertyId: number,
    myAccessOnly = false
  ): Promise<IMeterMeterListGetResponse> {
    return this.get<IMeterMeterListGetResponse>(
      `property/${propertyId}/meter/list?myAccessOnly=${myAccessOnly}`
    );
  }

  /**
   * https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/consumptionData/get
   *
   * @param meterId Id to the meter
   * @param page  Optional. Indicates the page number set of results to retrieve. This is typically omitted on the initial call and is provided if the results are paginated.
   * @param startDate Optional. Indicates the start date of a custom date range to retrieve consumption data. Must be a valid date formatted as YYYY-MM-DD.
   * @param endDate Optional. Indicates the end date of a custom date range to retrieve consumption data. Must be a valid date formatted as YYYY-MM-DD.
   */
  async meterConsumptionDataGet(
    meterId: number,
    page?: number,
    startDate?: string,
    endDate?: string
  ): Promise<IMeterConsumptionDataGetResponse> {
    const args: string[] = [];
    if (page) {
      args.push(`page=${page}`);
    }
    if (startDate) {
      args.push(`startDate=${startDate}`);
    }
    if (endDate) {
      args.push(`endDate=${endDate}`);
    }
    const url = `/meter/${meterId}/consumptionData?${args.join("&")}`;
    return this.get<IMeterConsumptionDataGetResponse>(url);
  }

  /**
   * GET	/property/(propertyId)/design/metrics
   * Returns a list of metric values for an existing property design. The property must already be shared with you.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/designMetrics/get
   */
  async propertyDesignMetricsGet(
    propertyId: number,
    measurementSystem: MeasurementSystem = "EPA"
  ): Promise<IPropertyDesignMetricsGetResponse> {
    const url = `/property/${propertyId}/design/metrics?measurementSystem=${measurementSystem}`;

    return this.get<IPropertyDesignMetricsGetResponse>(url);
  }

  /**
   * GET	/property/(propertyId)/metrics
   * Returns the values for a specified set of metrics and units for a specific property and period ending date. The property must already be shared with you.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/propertyMetrics/get
   */
  async propertyMetricsGet(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[],
    measurementSystem: MeasurementSystem = "EPA"
  ): Promise<IPropertyMetricsGetResponse> {
    const args = [
      `year=${year}`,
      `month=${month}`,
      `measurementSystem=${measurementSystem}`,
    ];
    const options: RequestInit = {
      headers: {
        "PM-Metrics": metrics.join(","),
      },
    };
    const url = `/property/${propertyId}/metrics?${args.join("&")}`;
    return this.get<IPropertyMetricsGetResponse>(url, options);
  }

  /**
   * GET	/property/(propertyId)/metrics/monthly
   * Returns a list of monthly metric values for a specific property and period ending date based on the specified set of metrics and measurement system.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/propertyMetricsMonthly/get
   */
  async propertyMetricsMonthlyGet(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[],
    measurementSystem: MeasurementSystem = "EPA"
  ): Promise<IPropertyMetricsMonthlyGetResponse> {
    const args = [
      `year=${year}`,
      `month=${month}`,
      `measurementSystem=${measurementSystem}`,
    ];
    const options: RequestInit = {
      headers: {
        "PM-Metrics": metrics.join(","),
      },
    };
    const url = `/property/${propertyId}/metrics/monthly?${args.join("&")}`;
    return this.get<IPropertyMetricsMonthlyGetResponse>(url, options);
  }

  /**
   * GET	/property/(propertyId)/reasonsForNoScore
   * Returns a list of alert information that explains why a specific property cannot receive an ENERGY STAR score for a specific period ending date.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/reasonsForNoScore/get
   */
  /**
   * GET	/property/(propertyId)/reasonsForNoWaterScore
   * Returns a list of alert information that explains why a specific property cannot receive an ENERGY STAR water score for a specific period ending date.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/reasonsForNoWaterScore/get
   */
  /**
   * GET	/property/(propertyId)/useDetails/metrics
   * Returns the time-weighted use detail values for a specific property, period ending date, and measurement system. The property must already be shared with you.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/useDetailsMetrics/get
   */
}
