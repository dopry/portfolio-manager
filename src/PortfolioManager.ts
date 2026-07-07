import {
  PortfolioManagerApi,
  isPortfolioManagerApiError,
} from "./PortfolioManagerApi.js";
import { mapWithConcurrency } from "./functions/mapWithConcurrency.js";
import { parseLinkId } from "./functions/parseLinkId.js";
import {
  IAccount,
  IAdditionalIdentifier,
  IClientConsumption,
  IClientMeter,
  IClientMeterPropertyAssociation,
  IClientMetric,
  IClientProperty,
  ILink,
  IMeter,
  IMeterConsumption,
  IMeterData,
  IMeterDelivery,
  IProperty,
  isIDeliveryMeterData,
  isIEmptyResponse,
  isIMeteredMeterData,
  isIPopulatedResponse,
  isIPropertyMonthlyMetric,
  isIPropertyAnnualMetric,
  isIPropertyMetricValueNull,
  IClientMetricMonthly,
  IClientMetricMonthlyValue,
  IClientPendingConnectionRequest,
  IClientPendingShareRequest,
  IClientNotification,
  ICustomFieldList,
  ICustomer,
  INotification,
  ShareLevel,
  AcceptRejectAction,
} from "./types/index.js";

/**
 * A developer friendly Facade for interacting with Energy Star Portfolio Manager.
 *
 * Responsbilities:
 * - Type safety
 * - Caching
 * - Error handling
 * - Simplify Relationships: provide methods to return entites instead of links
 * - Convert to more accessible types and structures
 *   - strip away superfluous response hierarchy
 *
 * - TODO: map to simplified types.
 */
export interface PortfolioManagerOptions {
  /**
   * Maximum concurrent API requests for fan-out operations such as
   * getProperties() and getMeters(). The ESPM API rate-limits aggressively,
   * so unbounded fan-out over large accounts trips 429s. Defaults to 5.
   */
  concurrency?: number;
  /**
   * Sink for facade error logging (partial failures in fan-outs, unexpected
   * response shapes). Defaults to console, which suits stdout/stderr log
   * collection in containerized deployments; inject a custom sink to
   * redirect or silence it.
   */
  logger?: Pick<Console, "error">;
}

export class PortfolioManager {
  protected _accountPromise: Promise<IAccount> | undefined;
  protected readonly concurrency: number;
  protected readonly logger: Pick<Console, "error">;

  constructor(
    protected api: PortfolioManagerApi,
    options: PortfolioManagerOptions = {},
  ) {
    const logger = options.logger ?? console;
    if (typeof logger.error !== "function") {
      throw new Error(
        "Invalid logger option: expected an object with an error method",
      );
    }
    this.logger = logger;
    const concurrency = options.concurrency ?? 5;
    // Fail fast on misconfiguration instead of erroring later inside the
    // first fan-out call.
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error(`Invalid concurrency option: ${concurrency}`);
    }
    this.concurrency = concurrency;
  }

  protected async _getAccount(): Promise<IAccount> {
    const response = await this.api.accountAccountGet();
    if (response.account) {
      return response.account;
    }
    throw new Error(`No account found:\n ${JSON.stringify(response, null, 2)}`);
  }

  async getAccount(cached = true): Promise<IAccount> {
    if (!this._accountPromise || !cached) {
      const promise = this._getAccount();
      promise.catch(() => {
        this._accountPromise = undefined;
      });
      this._accountPromise = promise;
    }
    return this._accountPromise;
  }

  async getAccountId(): Promise<number> {
    const account = await this.getAccount();
    if (account.id) return account.id;
    else
      throw new Error(
        `No account id found:\n ${JSON.stringify(account, null, 2)}`,
      );
  }

  async getMeter(meterId: number): Promise<IClientMeter> {
    const response = await this.api.meterMeterGet(meterId);
    if (response.meter) {
      // ensure id is set since it is minOccur 0 in the xsd, and the client guarantees it is set
      const meter = Object.assign({ id: meterId }, response.meter);
      return meter;
    } else
      throw new Error(`No meter found:\n ${JSON.stringify(response, null, 2)}`);
  }

  async getMeterAdditionalIdentifier(
    meterId: number,
    additionalIdentifierId: number,
  ): Promise<IAdditionalIdentifier> {
    try {
      const response = await this.api.meterIdentifierGet(
        meterId,
        additionalIdentifierId,
      );
      return response.additionalIdentifier;
    } catch (error) {
      if (!isPortfolioManagerApiError(error)) {
        throw error;
      }
      if (error.status == 404) {
        // meter not found, throw a more meaningful error.
        throw new Error(`Meter or additionalIdentifier not found: ${meterId}`, {
          cause: error,
        });
      }
      throw error;
    }
  }

  async postMeterAdditionalIdentifier(
    meterId: number,
    additionalIdentifier: Omit<IAdditionalIdentifier, "@_id">,
  ): Promise<ILink[]> {
    try {
      const response = await this.api.meterIdentifierPost(
        meterId,
        additionalIdentifier,
      );
      if (isIPopulatedResponse(response.response)) {
        return response.response.links.link;
      }
      throw new Error(`Unable to create additionalIdentifier: ${meterId}`);
    } catch (error) {
      if (!isPortfolioManagerApiError(error)) {
        throw error;
      }
      if (error.status == 404) {
        // meter not found, throw a more meaningful error.
        throw new Error(`Meter not found: ${meterId}`, { cause: error });
      }
      throw error;
    }
  }

  async putMeterAdditionalIdentifier(
    meterId: number,
    identifierId: number,
    additionalIdentifier: IAdditionalIdentifier,
  ): Promise<ILink[]> {
    try {
      const response = await this.api.meterIdentifierPut(
        meterId,
        identifierId,
        additionalIdentifier,
      );
      if (isIPopulatedResponse(response.response)) {
        return response.response.links.link;
      }
      throw new Error(`Unable to update additionalIdentifier: ${meterId}`);
    } catch (error) {
      if (!isPortfolioManagerApiError(error)) {
        throw error;
      }
      if (error.status == 404) {
        // meter not found, throw a more meaningful error.
        throw new Error(`Meter not found: ${meterId}`, { cause: error });
      }
      throw error;
    }
  }

  async getMeterAdditionalIdentifiers(
    meterId: number,
  ): Promise<IAdditionalIdentifier[]> {
    try {
      const response = await this.api.meterIdentifierListGet(meterId);
      return response.additionalIdentifiers.additionalIdentifier || [];
    } catch (error) {
      if (!isPortfolioManagerApiError(error)) {
        throw error;
      }
      if (error.status == 404) {
        // meter not found, throw a more meaningful error.
        throw new Error(`Meter not found: ${meterId}`, { cause: error });
      }
      throw error;
    }
  }

  async upsertMeterAdditionalIdentifier(
    meterId: number,
    name: string,
    value: string,
  ): Promise<IAdditionalIdentifier[]> {
    const identifiers = await this.getMeterAdditionalIdentifiers(meterId);
    const identifier = identifiers.find(
      (identifier) => identifier.description == name,
    );
    // upsert the identifier if it exists.
    if (identifier) {
      const id = parseInt(identifier["@_id"], 10);
      if (Number.isNaN(id)) {
        throw new Error(
          `Invalid additional identifier id for meter ${meterId}: ${identifier["@_id"]}`,
        );
      }
      // update the identifier
      await this.putMeterAdditionalIdentifier(meterId, id, {
        ...identifier,
        value,
      });
    } else {
      // insert
      // 1. find the next available custom id slot
      const availableIdentifierTypes = ["1", "2", "3"].filter(
        (id) =>
          !identifiers.find(
            (identifier) => identifier.additionalIdentifierType["@_id"] == id,
          ),
      );
      if (availableIdentifierTypes.length == 0) {
        throw new Error(`No available Custom ID slots for meter: ${meterId}`);
      }
      const typeId = availableIdentifierTypes[0];
      // 2. create the new identifier
      await this.postMeterAdditionalIdentifier(meterId, {
        additionalIdentifierType: {
          "@_id": typeId,
          "@_standardApproved": "false",
          "@_name": "Custom ID " + typeId,
          "@_description": "Custom ID " + typeId,
        },
        description: name,
        value,
      });
    }
    return this.getMeterAdditionalIdentifiers(meterId);
  }

  async getMeterConsumption(
    meterId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<IClientConsumption[]> {
    const getConsumptionRecordFromMeterData = (
      meterData: IMeterData,
    ): IMeterConsumption[] | IMeterDelivery[] => {
      // I'm assuming if meter.metered == true  then meterConsumption will be present, otherwise meterDelivery will be present
      // based on `Indicates if the meter is set up to be metered monthly or for bulk delivery`
      // see: https://portfoliomanager.energystar.gov/schema/18.0/meter/meter.xsd
      if (isIMeteredMeterData(meterData)) {
        return meterData.meterConsumption;
      }
      if (isIDeliveryMeterData(meterData)) {
        return meterData.meterDelivery;
      }
      this.logger.error(
        `Unable to determine meter consumption type returning an empty array`,
        { meterId, startDate, endDate, meterData },
      );
      // return an empty array since it
      return [];
    };

    const meterData: (IMeterDelivery | IMeterConsumption)[] = [];
    let nextPage: number | undefined = undefined;
    do {
      const response = await this.api.meterConsumptionDataGet(
        meterId,
        nextPage,
        startDate,
        endDate,
      );
      if (!response.meterData)
        throw new Error(
          `No meter consumption found:\n ${JSON.stringify(response, null, 2)}`,
        );
      const page = getConsumptionRecordFromMeterData(response.meterData);
      meterData.push(...page);

      const links = response.meterData.links
        ? response.meterData.links.link
        : undefined;
      const nextLink =
        links && links.length > 0
          ? links.find((link) => link["@_linkDescription"] == "next page")
          : undefined;

      const nextLinkUrl = nextLink ? nextLink["@_link"] : undefined;
      if (!nextLinkUrl) {
        nextPage = undefined;
      } else {
        const nextPageStr = nextLinkUrl.split("=").pop() || "";
        const parsedNextPage = parseInt(nextPageStr, 10);
        if (Number.isNaN(parsedNextPage)) {
          throw new Error(
            `Invalid next page link for meter ${meterId}: ${nextLinkUrl}`,
          );
        }
        nextPage = parsedNextPage;
      }
    } while (nextPage !== undefined);
    return meterData;
  }

  async getMeterLinks(
    propertyId: number,
    myAccessOnly?: boolean,
  ): Promise<ILink[]> {
    const response = await this.api.meterMeterListGet(propertyId, myAccessOnly);

    if (response.response["@_status"] != "Ok") {
      throw new Error(
        "Request Error, response: " + JSON.stringify(response, null, 2),
      );
    }

    if (isIEmptyResponse(response.response)) {
      // test for an empty response first, since in the past I've seen the response.response.links.link
      // appear as [ function ] even though respone.links was ''.
      return [];
    }
    if (isIPopulatedResponse(response.response)) {
      return response.response.links.link;
    }
    // just some defensive coding in csae the response is not empty or populated
    return [];
  }

  async createMeter(propertyId: number, meter: Omit<IMeter, "id">) {
    const response = await this.api.meterMeterPost(propertyId, meter);
    if (isIPopulatedResponse(response.response)) {
      return this.getMeter(response.response.id);
    }
    throw new Error("Failed to create meter: " + JSON.stringify(response));
  }

  async deleteMeter(meterId: number): Promise<boolean> {
    const response = await this.api.meterMeterDelete(meterId);
    if (response.response?.["@_status"] === "Ok") {
      return true;
    }
    throw new Error("Failed to delete meter: " + JSON.stringify(response));
  }

  async getMeters(propertyId: number): Promise<IMeter[]> {
    const links = await this.getMeterLinks(propertyId);
    const meters = await mapWithConcurrency(
      links,
      this.concurrency,
      async (link) => {
        const id = parseLinkId(link);
        if (id === undefined) {
          throw new Error(`Invalid meter id in link: ${JSON.stringify(link)}`);
        }
        return await this.getMeter(id);
      },
    );
    return meters;
  }

  async getAssociatedMeters(
    propertyId: number,
  ): Promise<IClientMeterPropertyAssociation> {
    const response = await this.api.meterPropertyAssociationGet(propertyId);
    if (!response.meterPropertyAssociationList)
      throw new Error(
        `No associated meters found(${propertyId}):\n ${JSON.stringify(
          response,
          null,
          2,
        )}`,
      );

    const energyMeterAssociation =
      (response.meterPropertyAssociationList.energyMeterAssociation && {
        meters:
          response.meterPropertyAssociationList.energyMeterAssociation.meters
            .meterId,
        propertyRepresentation:
          response.meterPropertyAssociationList.energyMeterAssociation
            .propertyRepresentation,
      }) ||
      undefined;

    const waterMeterAssociation =
      (response.meterPropertyAssociationList.waterMeterAssociation && {
        meters:
          response.meterPropertyAssociationList.waterMeterAssociation.meters
            .meterId,
        propertyRepresentation:
          response.meterPropertyAssociationList.waterMeterAssociation
            .propertyRepresentation,
      }) ||
      undefined;

    const wasteMeterAssociation =
      (response.meterPropertyAssociationList.wasteMeterAssociation && {
        meters:
          response.meterPropertyAssociationList.wasteMeterAssociation.meters
            .meterId,
        propertyRepresentation:
          response.meterPropertyAssociationList.wasteMeterAssociation
            .propertyRepresentation,
      }) ||
      undefined;

    const association = {
      propertyId,
      energyMeterAssociation,
      waterMeterAssociation,
      wasteMeterAssociation,
    };
    return association;
  }

  async getMetersPropertiesAssociation(
    propertyIds: number[],
  ): Promise<IClientMeterPropertyAssociation[]> {
    const maybeAssociations = await mapWithConcurrency(
      propertyIds,
      this.concurrency,
      async (propertyId) => {
        try {
          return await this.getAssociatedMeters(propertyId);
        } catch (reason) {
          this.logger.error("Error getting meter property association", reason);
          return undefined;
        }
      },
    );
    return maybeAssociations.filter(
      (association): association is IClientMeterPropertyAssociation =>
        association !== undefined,
    );
  }

  async createProperty(property: Omit<IProperty, "id">): Promise<IProperty> {
    const account = await this.getAccount();
    const response = await this.api.propertyPropertyPost(property, account.id);
    if (isIPopulatedResponse(response.response)) {
      const propertyId = response.response.id;
      return await this.getProperty(propertyId);
    } else {
      throw new Error("Failed to create property: " + JSON.stringify(response));
    }
  }

  /**
   * Deletes a property by unlinking it from the account.
   *
   * Note: the PM API performs a soft delete — the property is removed from the
   * account's property list, but getProperty() will still resolve for the
   * deleted ID. Any meters on the property become inaccessible (403).
   */
  async deleteProperty(propertyId: number): Promise<boolean> {
    const response = await this.api.propertyPropertyDelete(propertyId);
    if (response.response?.["@_status"] === "Ok") {
      return true;
    }
    throw new Error("Failed to delete property: " + JSON.stringify(response));
  }

  async getProperty(propertyId: number): Promise<IClientProperty> {
    const response = await this.api.propertyPropertyGet(propertyId);
    if (response.property) {
      // add ID property to returned entity, this makes it easier to use
      // and cross-reference with other entities
      const property = { ...response.property, id: propertyId };
      return property;
    } else
      throw new Error(
        `No property found:\n ${JSON.stringify(response, null, 2)}`,
      );
  }

  async getPropertyLinks(accountId?: number): Promise<ILink[]> {
    if (!accountId) accountId = await this.getAccountId();
    const response = await this.api.propertyPropertyListGet(accountId);

    // need to check reponses.links exists since it sometimes returns a string that has a link property that i a function
    // and not a link object
    if (!isIPopulatedResponse(response.response)) {
      throw new Error(
        `No properties found:\n ${JSON.stringify(response, null, 2)}`,
      );
    }
    return response.response.links.link;
  }

  async getProperties(accountId?: number): Promise<IClientProperty[]> {
    if (!accountId) accountId = await this.getAccountId();
    const links = await this.getPropertyLinks(accountId);
    const properties = await mapWithConcurrency(
      links,
      this.concurrency,
      async (link) => {
        const id = parseLinkId(link);
        if (id === undefined) {
          throw new Error(
            `Invalid property id in link: ${JSON.stringify(link)}`,
          );
        }
        return await this.getProperty(id);
      },
    );
    return properties;
  }

  async getPropertyMonthlyMetrics(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[] = [
      "siteElectricityUseMonthly",
      "siteNaturalGasUseMonthly",
      "siteEnergyUseFuelOil1Monthly",
      "siteEnergyUseFuelOil2Monthly",
      "siteEnergyUseFuelOil4Monthly",
      "siteEnergyUseFuelOil5And6Monthly",
      "siteElectricityUseOnsiteRenewablesMonthly",
    ],
    exclude_null = true,
  ): Promise<IClientMetric[]> {
    const response = await this.api.propertyMetricsMonthlyGet(
      propertyId,
      year,
      month,
      metrics,
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property monthly metrics found:\n ${JSON.stringify(
          response,
          null,
          2,
        )}`,
      );
    }
    // to make this more usable with our field selection options, we will flatten the metrics, then select the fields.
    return response.propertyMetrics.metric.reduce<IClientMetric[]>(
      (acc, series) => {
        const name = series["@_name"];
        const uom = series["@_uom"];
        if (!isIPropertyMonthlyMetric(series)) return acc;
        return series.monthlyMetric?.reduce<IClientMetric[]>((acc, monthly) => {
          const value = Object.prototype.hasOwnProperty.call(
            monthly["value"],
            "@_xsi:nil",
          )
            ? null
            : monthly["value"];
          if (exclude_null && value === null) return acc;
          const month = parseInt(monthly["@_month"], 10);
          const year = parseInt(monthly["@_year"], 10);
          if (Number.isNaN(month) || Number.isNaN(year)) {
            throw new Error(
              `Invalid monthly metric date for property ${propertyId}`,
            );
          }
          const metric = { propertyId, name, uom, month, year, value };
          acc.push(metric);
          return acc;
        }, acc);
      },
      [],
    );
  }

  async getPropertyMonthlyMetrics2(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[] = [],
    exclude_null = true,
  ): Promise<Record<string, IClientMetricMonthly>> {
    if (metrics.length == 0) {
      throw new Error("No metrics provided");
    }
    if (metrics.length > 10) {
      throw new Error("Too many metrics provided, maximum if 10 metrics");
    }
    //fetch the metrics, but don't flatten, key them on mertric name.
    const response = await this.api.propertyMetricsGet(
      propertyId,
      year,
      month,
      metrics,
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property metrics found:\n ${JSON.stringify(response, null, 2)}`,
      );
    }
    // to make this more usable with our field selection options, we will flatten the metrics, then select the fields.
    return response.propertyMetrics.metric.reduce<
      Record<string, IClientMetricMonthly>
    >((acc, series) => {
      if (!isIPropertyMonthlyMetric(series)) return acc;
      const name = series["@_name"];
      const uom = series["@_uom"] || "";

      const value = series.monthlyMetric?.reduce<IClientMetricMonthlyValue[]>(
        (monthlyAcc, monthly) => {
          const monthlyValue = Object.prototype.hasOwnProperty.call(
            monthly["value"],
            "@_xsi:nil",
          )
            ? null
            : monthly["value"];
          if (exclude_null && monthlyValue === null) return monthlyAcc;
          const month = parseInt(monthly["@_month"], 10);
          const year = parseInt(monthly["@_year"], 10);
          if (Number.isNaN(month) || Number.isNaN(year)) {
            throw new Error(
              `Invalid monthly metric date for property ${propertyId}`,
            );
          }
          const metric: IClientMetricMonthlyValue = {
            month,
            year,
            value: monthlyValue,
          };
          monthlyAcc.push(metric);
          return monthlyAcc;
        },
        [],
      );

      if (exclude_null && value.length == 0) return acc;
      const metric: IClientMetricMonthly = {
        propertyId,
        name,
        uom,
        value,
        month,
        year,
      };
      acc[name] = metric;
      return acc;
    }, {});
  }

  // returns a metric indexed
  async getPropertyMetrics(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[] = [],
    exclude_null = true,
  ): Promise<Record<string, IClientMetric>> {
    if (metrics.length == 0) {
      throw new Error("No metrics provided");
    }
    if (metrics.length > 10) {
      throw new Error("Too many metrics provided, maximum if 10 metrics");
    }
    //fetch the metrics, but don't flatten, key them on mertric name.
    const response = await this.api.propertyMetricsGet(
      propertyId,
      year,
      month,
      metrics,
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property metrics found:\n ${JSON.stringify(response, null, 2)}`,
      );
    }
    // In this version we will key the metrics on the metric name, and return the metric or an array of metrics for monthly metrics.
    return response.propertyMetrics.metric.reduce<
      Record<string, IClientMetric>
    >((acc, series) => {
      if (isIPropertyAnnualMetric(series)) {
        const name = series["@_name"];
        const uom = series["@_uom"] || "";
        const value = isIPropertyMetricValueNull(series["value"])
          ? null
          : series["value"];
        if (exclude_null && value === null) return acc;
        acc[name] = { propertyId, name, uom, year, month, value };
      }
      return acc;
    }, {});
  }
  /**
   * Flattens an XML custom field list into a key-value map.
   * @param customFieldList The raw custom field list from an ESPM response.
   * @returns A key-value map of custom fields, or undefined when there are none.
   */
  private mapCustomFields(
    customFieldList?: ICustomFieldList,
  ): Record<string, string | number> | undefined {
    if (!customFieldList?.customField) return undefined;
    const customFields = Array.isArray(customFieldList.customField)
      ? customFieldList.customField
      : [customFieldList.customField];
    return customFields.filter(Boolean).reduce(
      (acc, field) => {
        if (field && field["@_name"] && field["#text"] !== undefined) {
          acc[field["@_name"]] = field["#text"];
        }
        return acc;
      },
      {} as Record<string, string | number>,
    );
  }

  /**
   * Drains a paginated pending-list endpoint: fetches page 1, maps each
   * page's items, and keeps fetching while the response advertises a
   * "next page" link. Shared by the pending connection/property/meter
   * listings, which differ only in the endpoint and the item mapping.
   */
  private async collectPendingPages<
    RESP extends { pendingList: { links?: { link: ILink[] } } },
    ITEM,
    OUT,
  >(
    fetchPage: (page: number) => Promise<RESP>,
    getItems: (response: RESP) => ITEM[] | undefined,
    mapItem: (item: ITEM) => OUT,
  ): Promise<OUT[]> {
    const results: OUT[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const response = await fetchPage(page);
      for (const item of getItems(response) || []) {
        results.push(mapItem(item));
      }
      const nextLink = response.pendingList.links?.link.find(
        (link) => link["@_linkDescription"] === "next page",
      );
      hasMore = !!nextLink;
      page++;
    }
    return results;
  }

  /**
   * Fetches all pending connection requests from other Portfolio Manager users.
   * This method handles pagination automatically.
   * @returns A promise that resolves to an array of simplified pending connection request objects.
   */
  async getPendingConnections(): Promise<IClientPendingConnectionRequest[]> {
    return this.collectPendingPages(
      (page) => this.api.connectAccountPendingListGet(page),
      (response) => response.pendingList.account,
      (account) => ({
        accountId: account.accountId,
        username: account.username,
        firstName: account.accountInfo.firstName,
        lastName: account.accountInfo.lastName,
        email: account.accountInfo.email,
        organization: account.accountInfo.organization,
        requestedDate: account.connectionAudit?.createdDate || "",
        customFields: this.mapCustomFields(account.customFieldList),
      }),
    );
  }

  /**
   * Accepts a pending connection request from another user.
   * @param accountId The ID of the account whose connection request you want to accept.
   * @param note An optional note to include with the acceptance.
   * @returns A promise that resolves on successful acceptance.
   */
  async acceptConnection(accountId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Accept" as AcceptRejectAction, note },
    };
    await this.api.connectAccountPost(accountId, body);
  }

  /**
   * Rejects a pending connection request from another user.
   * @param accountId The ID of the account whose connection request you want to reject.
   * @param note An optional note to include with the rejection.
   * @returns A promise that resolves on successful rejection.
   */
  async rejectConnection(accountId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Reject" as AcceptRejectAction, note },
    };
    await this.api.connectAccountPost(accountId, body);
  }

  /**
   * Disconnects from a user's account, optionally keeping existing shares.
   * @param accountId The ID of the account to disconnect from.
   * @param options Configuration for the disconnect action.
   * @param options.keepShares If true, existing property and meter shares will not be removed. Defaults to false.
   * @param options.note An optional note to include with the disconnection.
   * @returns A promise that resolves on successful disconnection.
   */
  async disconnect(
    accountId: number,
    options: { keepShares?: boolean; note?: string } = {},
  ): Promise<void> {
    const body = { terminateSharingResponse: { note: options.note } };
    await this.api.disconnectAccountPost(accountId, body, options.keepShares);
  }

  /**
   * Fetches all pending property share requests.
   * This method handles pagination automatically.
   * @returns A promise that resolves to an array of simplified pending property share request objects.
   */
  async getPendingPropertyShares(): Promise<IClientPendingShareRequest[]> {
    return this.collectPendingPages(
      (page) => this.api.sharePropertyPendingListGet(page),
      (response) => response.pendingList.property,
      (prop) => ({
        type: "property" as const,
        id: prop.propertyId,
        propertyId: prop.propertyId,
        propertyName: prop.propertyInfo.name,
        sharerUsername: prop.username,
        sharerAccountId: prop.accountId,
        accessLevel: prop.accessLevel as ShareLevel,
        requestedDate: prop.shareAudit?.createdDate || "",
        customFields: this.mapCustomFields(prop.customFieldList),
      }),
    );
  }

  /**
   * Fetches all pending meter share requests.
   * This method handles pagination automatically.
   * @returns A promise that resolves to an array of simplified pending meter share request objects.
   */
  async getPendingMeterShares(): Promise<IClientPendingShareRequest[]> {
    return this.collectPendingPages(
      (page) => this.api.shareMeterPendingListGet(page),
      (response) => response.pendingList.meter,
      (meter) => ({
        type: "meter" as const,
        id: meter.meterId,
        propertyId: meter.propertyId,
        propertyName: meter.propertyInfo.name,
        sharerUsername: meter.username,
        sharerAccountId: meter.accountId,
        accessLevel: meter.accessLevel as ShareLevel,
        requestedDate: meter.shareAudit?.createdDate || "",
        customFields: this.mapCustomFields(meter.customFieldList),
      }),
    );
  }

  /**
   * Accepts a pending property share request.
   * @param propertyId The ID of the property share to accept.
   * @param note An optional note to include with the acceptance.
   */
  async acceptPropertyShare(propertyId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Accept" as AcceptRejectAction, note },
    };
    await this.api.sharePropertyPost(propertyId, body);
  }

  /**
   * Rejects a pending property share request.
   * @param propertyId The ID of the property share to reject.
   * @param note An optional note to include with the rejection.
   */
  async rejectPropertyShare(propertyId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Reject" as AcceptRejectAction, note },
    };
    await this.api.sharePropertyPost(propertyId, body);
  }

  /**
   * Accepts a pending meter share request.
   * @param meterId The ID of the meter share to accept.
   * @param note An optional note to include with the acceptance.
   */
  async acceptMeterShare(meterId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Accept" as AcceptRejectAction, note },
    };
    await this.api.shareMeterPost(meterId, body);
  }

  /**
   * Rejects a pending meter share request.
   * @param meterId The ID of the meter share to reject.
   * @param note An optional note to include with the rejection.
   */
  async rejectMeterShare(meterId: number, note?: string): Promise<void> {
    const body = {
      sharingResponse: { action: "Reject" as AcceptRejectAction, note },
    };
    await this.api.shareMeterPost(meterId, body);
  }

  /**
   * Removes an existing share to a property.
   * @param propertyId The ID of the property to unshare.
   * @param note An optional note explaining the reason for unsharing.
   */
  async unshareProperty(propertyId: number, note?: string): Promise<void> {
    const body = { terminateSharingResponse: { note } };
    await this.api.unsharePropertyPost(propertyId, body);
  }

  /**
   * Removes an existing share to a meter.
   * @param meterId The ID of the meter to unshare.
   * @param note An optional note explaining the reason for unsharing.
   */
  async unshareMeter(meterId: number, note?: string): Promise<void> {
    const body = { terminateSharingResponse: { note } };
    await this.api.unshareMeterPost(meterId, body);
  }

  /**
   * Fetches notifications from the system, such as disconnect or unshare events.
   * By default, this action marks the notifications as "read" on the server.
   * @param options Configuration for fetching notifications.
   * @param options.markAsRead If true, notifications are marked as read after being fetched. Defaults to true.
   * @returns A promise that resolves to an array of simplified notification objects.
   */
  async getNotifications(
    options: { markAsRead?: boolean } = { markAsRead: true },
  ): Promise<IClientNotification[]> {
    const response = await this.api.notificationListGet(options.markAsRead);
    const notifications = response.notificationList.notification || [];

    return notifications.map((n: INotification) => ({
      id: n.notificationId,
      type: n.notificationTypeCode,
      date: n.notificationCreatedDate || "",
      description: n.description,
      accountId: n.accountId,
      propertyId: n.propertyId,
      meterId: n.meterId,
      createdByUsername: n.notificationCreatedBy,
      createdByAccountId: n.notificationCreatedByAccountId,
    }));
  }

  /**
   * Fetches a list of customers that you are connected to.
   * @returns A promise that resolves to an array of simplified customer objects.
   */
  async getCustomerList(): Promise<ICustomer[]> {
    const response = await this.api.customerListGet();

    if (response.response["@_status"] != "Ok") {
      throw new Error(
        "Request Error, response: " + JSON.stringify(response, null, 2),
      );
    }

    if (isIEmptyResponse(response.response)) {
      return [];
    }
    if (isIPopulatedResponse(response.response)) {
      return response.response.links.link.map((link: ILink) => ({
        id: parseInt(link["@_id"] || "0"),
        organizationName: link["@_hint"] || "",
      }));
    }
    return [];
  }
}
