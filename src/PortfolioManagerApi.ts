import {
  X2jOptions,
  XMLBuilder,
  XMLParser,
  XmlBuilderOptions,
} from "fast-xml-parser";
import { isDate } from "util/types";
import { ARRAY_JPATHS } from "./types/xml/arrayJPaths.js";
import {
  IAccountAccountGetResponse,
  IAccountCustomerPostResponse,
  IAdditionalIdentifier,
  ICreateSamplePropertiesPostResponse,
  IGetCustomerListResponse,
  IGetNotificationListResponse,
  IGetPendingConnectionsResponse,
  IGetPendingMeterSharesResponse,
  IGetPendingPropertySharesResponse,
  IGetWhatChangedResponse,
  IMeterConsumptionDataGetResponse,
  IMeterConsumptionDataPutResponse,
  IMeterIdentifierGetResponse,
  IMeterIdentifierListGetResponse,
  IMeterIdentifierPostResponse,
  IMeterIdentifierPutResponse,
  IMeterIdentifierTypesListGetResponse,
  IMeterMeterGetResponse,
  IMeterMeterDeleteResponse,
  IMeterMeterListGetResponse,
  IMeterMeterPostResponse,
  IMeterPropertyAssociationGetResponse,
  IMeterPropertyAssociationPostResponse,
  IPropertyDesignMetricsGetResponse,
  IPropertyMetricsGetResponse,
  IPropertyMetricsMonthlyGetResponse,
  IPropertyPropertyGetResponse,
  IPropertyPropertyDeleteResponse,
  IPropertyPropertyListGetResponse,
  IPropertyPropertyPostResponse,
  IPropertyPropertyPutResponse,
  ISharingActionResponse,
  IWhatChangedOptions,
  MeasurementSystem,
} from "./types/index.js";
import {
  IAccount,
  IMeter,
  IMeterConsumption,
  IMeterData,
  IMeterDataPostRequest,
  IProperty,
  ISharingResponsePayload,
  ITerminateSharingResponsePayload,
  toXmlDateString,
} from "./types/xml/index.js";

export class PortfolioManagerApiError extends Error {
  static async fromResponse(response: Response) {
    const responseText = await response.text();
    const url = response.url;
    return new PortfolioManagerApiError(
      response.status,
      response.statusText,
      responseText,
      url,
    );
  }
  constructor(
    public status: number,
    public statusText: string,
    public responseText?: string,
    public url?: string,
  ) {
    super(statusText);
  }
}

export function isPortfolioManagerApiError(
  obj: unknown,
): obj is PortfolioManagerApiError {
  return obj instanceof PortfolioManagerApiError;
}

export interface PortfolioManagerApiOptions {
  /** Number of times to retry a request after a 429 Too Many Requests response. */
  maxRetries?: number;
  /**
   * Base delay in milliseconds between retries, doubled on each attempt.
   * Ignored when the response carries a numeric (delta-seconds) Retry-After
   * header; HTTP-date or negative values fall back to this backoff.
   */
  retryBaseDelayMs?: number;
}

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
    // fast-xml-parser collapses single-occurrence elements to plain
    // objects; ARRAY_JPATHS (generated from the vendored XSDs by
    // `npm run generate:xml`) pins every schema-repeatable element to
    // array shape so responses parse consistently. Since fxp 5.9 the
    // callback receives a MatcherView instead of a string when the
    // jPath option is off; stringifying covers both (MatcherView's
    // toString() yields the dotted jpath).
    isArray: (_name, jpath): boolean => ARRAY_JPATHS.has(String(jpath)),
  };
  xmlBuilderOptions: Partial<XmlBuilderOptions> = {
    ignoreAttributes: false,
    tagValueProcessor: (name, value) => {
      switch (name) {
        case "firstBillDate":
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            isDate(value)
          ) {
            const date = new Date(value);
            return toXmlDateString(date);
          }
          return value as string;
        default:
          return value as string;
      }
    },
  };

  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;

  constructor(
    private readonly endpoint: string,
    private readonly username: string,
    private readonly password: string,
    options: PortfolioManagerApiOptions = {},
  ) {
    this.maxRetries = options.maxRetries ?? 3;
    this.retryBaseDelayMs = options.retryBaseDelayMs ?? 1000;
  }

  /**
   * The ESPM API rate-limits requests (429, errorNumber -200). A Retry-After
   * header, when present and numeric, takes precedence over exponential backoff.
   */
  private retryDelayMs(response: Response, attempt: number): number {
    // Retry-After is delta-seconds, where 0 (retry immediately) is valid.
    // Non-numeric forms (e.g. an HTTP-date) fall back to exponential backoff.
    const header = response.headers.get("retry-after");
    if (header !== null) {
      const retryAfter = Number(header);
      if (Number.isFinite(retryAfter) && retryAfter >= 0) {
        return retryAfter * 1000;
      }
    }
    return this.retryBaseDelayMs * 2 ** attempt;
  }

  async fetch<RESP>(path: string, options: RequestInit = {}): Promise<RESP> {
    const headers: Record<string, string> = {
      "Content-Type": "application/xml",
    };
    // POST /account is the only path that doesn't require auth.
    if (path != "account" || options.method != "POST") {
      headers["Authorization"] =
        "Basic " +
        Buffer.from(`${this.username}:${this.password}`).toString("base64");
    }
    // Merge through Headers so every HeadersInit form (Headers instance,
    // tuple array, plain record) is accepted and keys merge
    // case-insensitively — a spread would duplicate e.g. Content-Type and
    // content-type, and would mangle non-record forms entirely.
    const mergedHeaders = new Headers(headers);
    new Headers(options.headers).forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
    const init: RequestInit = {
      method: "GET",
      ...options,
      headers: mergedHeaders,
    };
    // undici requires duplex: "half" for streaming request bodies and throws
    // a TypeError otherwise (node-fetch had no such requirement). Widen the
    // type locally: DOM's RequestInit (loaded by tsconfig.e2e.json's lib)
    // does not declare duplex, unlike undici's.
    const streamInit = init as RequestInit & { duplex?: "half" };
    if (init.body instanceof ReadableStream && streamInit.duplex == null) {
      streamInit.duplex = "half";
    }
    // Path convention: endpoint paths are relative (no leading slash), but
    // fetch() is public API, so strip a legacy leading slash defensively;
    // tolerate endpoints configured with or without a trailing slash.
    const relativePath = path.startsWith("/") ? path.slice(1) : path;
    const url = this.endpoint.endsWith("/")
      ? this.endpoint + relativePath
      : `${this.endpoint}/${relativePath}`;
    let response = await fetch(url, init);

    // Retrying is safe even for POST/PUT: a rate-limited request is rejected
    // before it is processed. Only requests with replayable (string or empty)
    // bodies are retried; a consumed stream body cannot be resent.
    const isReplayable = init.body == null || typeof init.body === "string";
    for (
      let attempt = 0;
      isReplayable && response.status === 429 && attempt < this.maxRetries;
      attempt++
    ) {
      const delay = this.retryDelayMs(response, attempt);
      // Drain the throttled response before discarding it so undici can
      // release the underlying socket.
      await response.text();
      await new Promise((resolve) => setTimeout(resolve, delay));
      response = await fetch(url, init);
    }

    // raise exception on 400-599 status codes
    if (response.status >= 400 && response.status < 600) {
      const error = await PortfolioManagerApiError.fromResponse(response);
      throw error;
    }

    const xmlResp = await response.text();
    if (xmlResp.trim().length === 0) {
      throw new PortfolioManagerApiError(
        response.status,
        response.statusText,
        "Empty response body",
        response.url,
      );
    }

    const parser = new XMLParser(this.xmlParserOptions);
    try {
      return parser.parse(xmlResp) as RESP;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown XML parse failure";
      const snippet = xmlResp.slice(0, 500);
      throw new PortfolioManagerApiError(
        response.status,
        response.statusText,
        `XML parse failure: ${message}\nResponse snippet: ${snippet}`,
        response.url,
      );
    }
  }

  /**
   * Some endpoints (e.g. meter/property association, sample properties)
   * take no request body — the whole operation is expressed in the URL.
   * fast-xml-parser >= 5.7 delegates building to fast-xml-builder, whose
   * build() throws on nullish input where older versions returned "", so
   * body-less requests must skip the builder entirely (an absent body and
   * an empty body are equivalent on the wire).
   */
  private buildBody(data: unknown): string | undefined {
    if (data == null) return undefined;
    const builder = new XMLBuilder(this.xmlBuilderOptions);
    return builder.build(data) as string;
  }

  /** Options (e.g. an AbortSignal) are forwarded; method and body win. */
  async post<REQ, RESP>(
    path: string,
    data: REQ,
    options: RequestInit = {},
  ): Promise<RESP> {
    const body = this.buildBody(data);
    return await this.fetch<RESP>(path, { ...options, method: "POST", body });
  }

  /** Options (e.g. an AbortSignal) are forwarded; method and body win. */
  async put<REQ, RESP>(
    path: string,
    data: REQ,
    options: RequestInit = {},
  ): Promise<RESP> {
    const body = this.buildBody(data);
    return await this.fetch<RESP>(path, { ...options, method: "PUT", body });
  }

  async get<RESP>(path: string, options: RequestInit = {}): Promise<RESP> {
    return this.fetch<RESP>(path, options);
  }

  async delete<RESP>(path: string, options: RequestInit = {}): Promise<RESP> {
    return this.fetch<RESP>(path, { ...options, method: "DELETE" });
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/account/account/get
  async accountAccountGet(): Promise<IAccountAccountGetResponse> {
    return this.get<IAccountAccountGetResponse>("account");
  }

  /** Creates and connects a customer account to the authenticated provider. */
  async accountCustomerPost(
    account: Omit<IAccount, "id">,
  ): Promise<IAccountCustomerPostResponse> {
    return this.post<
      { account: Omit<IAccount, "id"> },
      IAccountCustomerPostResponse
    >("customer", { account });
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/meter/get
  async meterMeterGet(meterId: number): Promise<IMeterMeterGetResponse> {
    return this.get<IMeterMeterGetResponse>(`meter/${meterId}`);
  }

  async meterMeterDelete(meterId: number): Promise<IMeterMeterDeleteResponse> {
    return this.delete<IMeterMeterDeleteResponse>(`meter/${meterId}`);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/property/get
  async propertyPropertyGet(
    propertyId: number,
  ): Promise<IPropertyPropertyGetResponse> {
    return this.get<IPropertyPropertyGetResponse>(`property/${propertyId}`);
  }

  /**
   * Deletes a property by unlinking it from the account.
   *
   * Note: the PM API performs a soft delete — the property is removed from the
   * account's property list, but GET /property/{id} will still return 200 with
   * the full entity. Any meters on the property become inaccessible (403).
   */
  async propertyPropertyDelete(
    propertyId: number,
  ): Promise<IPropertyPropertyDeleteResponse> {
    return this.delete<IPropertyPropertyDeleteResponse>(
      `property/${propertyId}`,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/property/post
  async propertyPropertyPost(
    property: Omit<IProperty, "id">,
    accountId: number,
  ): Promise<IPropertyPropertyPostResponse> {
    return this.post<
      { property: Omit<IProperty, "id"> },
      IPropertyPropertyPostResponse
    >(`account/${accountId}/property`, { property });
  }

  async propertyPropertyPut(
    propertyId: number,
    property: Omit<IProperty, "id" | "accessLevel" | "audit">,
  ): Promise<IPropertyPropertyPutResponse> {
    return this.put<
      { property: Omit<IProperty, "id" | "accessLevel" | "audit"> },
      IPropertyPropertyPutResponse
    >(`property/${propertyId}`, { property });
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/property/propertyList/get
  async propertyPropertyListGet(
    accountId: number,
  ): Promise<IPropertyPropertyListGetResponse> {
    return this.get<IPropertyPropertyListGetResponse>(
      `account/${accountId}/property/list`,
    );
  }

  private async getWhatChanged(
    resource: "property" | "propertyUse" | "meter",
    customerId: number,
    date: string,
    options: IWhatChangedOptions = {},
  ): Promise<IGetWhatChangedResponse> {
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new TypeError("date must be a valid date formatted as YYYY-MM-DD");
    }
    if (
      options.nextPageKey !== undefined &&
      options.previousPageKey !== undefined
    ) {
      throw new TypeError(
        "nextPageKey and previousPageKey cannot be used together",
      );
    }

    const query = new URLSearchParams({ date });
    if (options.nextPageKey !== undefined) {
      query.set("nextPageKey", String(options.nextPageKey));
    }
    if (options.previousPageKey !== undefined) {
      query.set("previousPageKey", String(options.previousPageKey));
    }
    return this.get<IGetWhatChangedResponse>(
      `customer/${customerId}/${resource}/whatChanged?${query.toString()}`,
    );
  }

  /**
   * Returns properties changed since the supplied date.
   * @see https://portfoliomanager.energystar.gov/webservices/home/api/property/getWhatChanged/get
   */
  async propertyGetWhatChangedGet(
    customerId: number,
    date: string,
    options: IWhatChangedOptions = {},
  ): Promise<IGetWhatChangedResponse> {
    return this.getWhatChanged("property", customerId, date, options);
  }

  /**
   * Returns property uses changed since the supplied date.
   * @see https://portfoliomanager.energystar.gov/webservices/home/api/propertyUse/getWhatChanged/get
   */
  async propertyUseGetWhatChangedGet(
    customerId: number,
    date: string,
    options: IWhatChangedOptions = {},
  ): Promise<IGetWhatChangedResponse> {
    return this.getWhatChanged("propertyUse", customerId, date, options);
  }

  /**
   * Returns meters changed since the supplied date.
   * @see https://portfoliomanager.energystar.gov/webservices/home/api/meter/getWhatChanged/get
   */
  async meterGetWhatChangedGet(
    customerId: number,
    date: string,
    options: IWhatChangedOptions = {},
  ): Promise<IGetWhatChangedResponse> {
    return this.getWhatChanged("meter", customerId, date, options);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/consumptionData/post
  async meterConsumptionDataPost(
    meterId: number,
    meterConsumption: IMeterDataPostRequest,
  ): Promise<IMeterData> {
    return this.post<IMeterDataPostRequest, IMeterData>(
      `meter/${meterId}/consumptionData`,
      meterConsumption,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/consumptionData/put
  async meterConsumptionDataPut(
    consumptionDataId: number,
    meterConsumption: IMeterConsumption,
  ) {
    return this.put<IMeterConsumption, IMeterConsumptionDataPutResponse>(
      `consumptionData/${consumptionDataId}`,
      meterConsumption,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/identifier/get
  async meterIdentifierGet(meterId: number, identifierId: number) {
    return this.get<IMeterIdentifierGetResponse>(
      `meter/${meterId}/identifier/${identifierId}`,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/identifier/post
  async meterIdentifierPost(
    meterId: number,
    identifier: Omit<IAdditionalIdentifier, "@_id">,
  ) {
    return this.post<
      { additionalIdentifier: Omit<IAdditionalIdentifier, "@_id"> },
      IMeterIdentifierPostResponse
    >(`meter/${meterId}/identifier`, { additionalIdentifier: identifier });
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/identifier/put
  async meterIdentifierPut(
    meterId: number,
    identifierId: number,
    identifier: IAdditionalIdentifier,
  ) {
    return this.put<
      { additionalIdentifier: IAdditionalIdentifier },
      IMeterIdentifierPutResponse
    >(`meter/${meterId}/identifier/${identifierId}`, {
      additionalIdentifier: identifier,
    });
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/identifierList/get
  async meterIdentifierListGet(
    meterId: number,
  ): Promise<IMeterIdentifierListGetResponse> {
    return this.get<IMeterIdentifierListGetResponse>(
      `meter/${meterId}/identifier/list`,
    );
  }

  async meterIdentifierTypesListGet(): Promise<IMeterIdentifierTypesListGetResponse> {
    return this.get<IMeterIdentifierTypesListGetResponse>(
      `meter/identifier/list`,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/meter/post
  async meterMeterPost(
    propertyId: number,
    meter: IMeter,
  ): Promise<IMeterMeterPostResponse> {
    return this.post<{ meter: IMeter }, IMeterMeterPostResponse>(
      `property/${propertyId}/meter/`,
      { meter },
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/propertyAssociation/get
  async meterPropertyAssociationGet(
    propertyId: number,
  ): Promise<IMeterPropertyAssociationGetResponse> {
    return this.get<IMeterPropertyAssociationGetResponse>(
      `association/property/${propertyId}/meter`,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/meter/propertyAssociation/post
  async meterPropertyAssociationSinglePost(
    propertyId: number,
    meterId: number,
  ): Promise<IMeterPropertyAssociationPostResponse> {
    return this.post<undefined, IMeterPropertyAssociationPostResponse>(
      `association/property/${propertyId}/meter/${meterId}`,
      undefined,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/meter/meterList/get
  async meterMeterListGet(
    propertyId: number,
    myAccessOnly = false,
  ): Promise<IMeterMeterListGetResponse> {
    return this.get<IMeterMeterListGetResponse>(
      `property/${propertyId}/meter/list?myAccessOnly=${myAccessOnly}`,
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
    endDate?: string,
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
    const query = args.length > 0 ? `?${args.join("&")}` : "";
    const url = `meter/${meterId}/consumptionData${query}`;
    return this.get<IMeterConsumptionDataGetResponse>(url);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/test/api/property/sample-testing/post
  async propertyCreateSamplePropertiesPOST(
    countryCode: "US" | "CA" = "US",
    createCount: number = 10,
  ): Promise<ICreateSamplePropertiesPostResponse> {
    return this.post<undefined, ICreateSamplePropertiesPostResponse>(
      `property/createSampleProperties?countryCode=${countryCode}&createCount=${createCount}`,
      undefined,
    );
  }

  /**
   * GET	/property/(propertyId)/design/metrics
   * Returns a list of metric values for an existing property design. The property must already be shared with you.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/reporting/designMetrics/get
   */
  async propertyDesignMetricsGet(
    propertyId: number,
    measurementSystem: MeasurementSystem = "EPA",
  ): Promise<IPropertyDesignMetricsGetResponse> {
    const url = `property/${propertyId}/design/metrics?measurementSystem=${measurementSystem}`;

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
    measurementSystem: MeasurementSystem = "EPA",
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
    const url = `property/${propertyId}/metrics?${args.join("&")}`;
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
    measurementSystem: MeasurementSystem = "EPA",
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
    const url = `property/${propertyId}/metrics/monthly?${args.join("&")}`;
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

  /* c8 ignore start */
  // Pending response wrappers depend on externally seeded requests in TEST.
  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingAccountList/get
  async connectAccountPendingListGet(
    page?: number,
  ): Promise<IGetPendingConnectionsResponse> {
    const url = page
      ? `connect/account/pending/list?page=${page}`
      : "connect/account/pending/list";
    return this.get<IGetPendingConnectionsResponse>(url);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/connect/post
  async connectAccountPost(
    accountId: number,
    body: ISharingResponsePayload,
  ): Promise<ISharingActionResponse> {
    return this.post<ISharingResponsePayload, ISharingActionResponse>(
      `connect/account/${accountId}`,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/disconnect/post
  async disconnectAccountPost(
    accountId: number,
    body: ITerminateSharingResponsePayload,
    keepShares: boolean = false,
  ): Promise<ISharingActionResponse> {
    const url = `disconnect/account/${accountId}?keepShares=${keepShares}`;
    return this.post<ITerminateSharingResponsePayload, ISharingActionResponse>(
      url,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingPropertyList/get
  async sharePropertyPendingListGet(
    page?: number,
  ): Promise<IGetPendingPropertySharesResponse> {
    const url = page
      ? `share/property/pending/list?page=${page}`
      : "share/property/pending/list";
    return this.get<IGetPendingPropertySharesResponse>(url);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/shareProperty/post
  async sharePropertyPost(
    propertyId: number,
    body: ISharingResponsePayload,
  ): Promise<ISharingActionResponse> {
    return this.post<ISharingResponsePayload, ISharingActionResponse>(
      `share/property/${propertyId}`,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/pendingMeterList/get
  async shareMeterPendingListGet(
    page?: number,
  ): Promise<IGetPendingMeterSharesResponse> {
    const url = page
      ? `share/meter/pending/list?page=${page}`
      : "share/meter/pending/list";
    return this.get<IGetPendingMeterSharesResponse>(url);
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/shareMeter/post
  async shareMeterPost(
    meterId: number,
    body: ISharingResponsePayload,
  ): Promise<ISharingActionResponse> {
    return this.post<ISharingResponsePayload, ISharingActionResponse>(
      `share/meter/${meterId}`,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/unshareProperty/post
  async unsharePropertyPost(
    propertyId: number,
    body: ITerminateSharingResponsePayload,
  ): Promise<ISharingActionResponse> {
    return this.post<ITerminateSharingResponsePayload, ISharingActionResponse>(
      `unshare/property/${propertyId}`,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/unshareMeter/post
  async unshareMeterPost(
    meterId: number,
    body: ITerminateSharingResponsePayload,
  ): Promise<ISharingActionResponse> {
    return this.post<ITerminateSharingResponsePayload, ISharingActionResponse>(
      `unshare/meter/${meterId}`,
      body,
    );
  }

  // https://portfoliomanager.energystar.gov/webservices/home/api/connection/notificationList/get
  async notificationListGet(
    clear: boolean = true,
  ): Promise<IGetNotificationListResponse> {
    return this.get<IGetNotificationListResponse>(
      `notification/list?clear=${clear}`,
    );
  }
  /* c8 ignore stop */

  /**
   * GET /customer/list
   * Returns a list of customers that you are connected to.
   * see: https://portfoliomanager.energystar.gov/webservices/home/api/customer/list
   */
  async customerListGet(): Promise<IGetCustomerListResponse> {
    return this.get<IGetCustomerListResponse>("customer/list");
  }
}
