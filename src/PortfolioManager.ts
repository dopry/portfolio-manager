import {
  PortfolioManagerApi,
  isPortfolioManagerApiError,
} from "./PortfolioManagerApi.js";
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
} from "./types/index.js";

async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
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
export class PortfolioManager {
  protected _accountPromise: Promise<IAccount> | undefined;

  constructor(protected api: PortfolioManagerApi) {}

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
      promise.catch((e) => {
        this._accountPromise = undefined;
        throw e;
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
        `No account id found:\n ${JSON.stringify(account, null, 2)}`
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
    additionalIdentifierId: number
  ): Promise<IAdditionalIdentifier> {
    try {
      const response = await this.api.meterIdentifierGet(
        meterId,
        additionalIdentifierId
      );
      return response.additionalIdentifier;
    } catch (error) {
      if (!isPortfolioManagerApiError(error)) {
        throw error;
      }
      if (error.status == 404) {
        // meter not found, throw a more meaningful error.
        throw new Error(`Meter or additionalIdentifier not found: ${meterId}`);
      }
      throw error;
    }
  }

  async postMeterAdditionalIdentifier(
    meterId: number,
    additionalIdentifier: Omit<IAdditionalIdentifier, "@_id">
  ): Promise<ILink[]> {
    try {
      const response = await this.api.meterIdentifierPost(
        meterId,
        additionalIdentifier
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
        throw new Error(`Meter not found: ${meterId}`);
      }
      throw error;
    }
  }

  async putMeterAdditionalIdentifier(
    meterId: number,
    identifierId: number,
    additionalIdentifier: IAdditionalIdentifier
  ): Promise<ILink[]> {
    try {
      const response = await this.api.meterIdentifierPut(
        meterId,
        identifierId,
        additionalIdentifier
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
        throw new Error(`Meter not found: ${meterId}`);
      }
      throw error;
    }
  }

  async getMeterAdditionalIdentifiers(
    meterId: number
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
        throw new Error(`Meter not found: ${meterId}`);
      }
      throw error;
    }
  }

  async upsertMeterAdditionalIdentifier(
    meterId: number,
    name: string,
    value: string
  ): Promise<IAdditionalIdentifier[]> {
    const identifiers = await this.getMeterAdditionalIdentifiers(meterId);
    const identifier = identifiers.find(
      (identifier) => identifier.description == name
    );
    // upsert the identifier if it exists.
    if (identifier) {
      const id = parseInt(identifier["@_id"]);
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
            (identifier) => identifier.additionalIdentifierType["@_id"] == id
          )
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
    endDate?: string
  ): Promise<IClientConsumption[]> {
    const getConsumptionRecordFromMeterData = (
      meterData: IMeterData
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
      console.error(
        `Unable to determine meter consumption type returning an empty array`,
        { meterId, startDate, endDate, meterData }
      );
      // return an empty array since it
      return [];
    };

    const response = await this.api.meterConsumptionDataGet(
      meterId,
      undefined,
      startDate,
      endDate
    );
    if (!response.meterData)
      throw new Error(
        `No meter consumption found:\n ${JSON.stringify(response, null, 2)}`
      );
    const meterData: (IMeterDelivery | IMeterConsumption)[] = [];
    let nextPage: number | typeof NaN | undefined = undefined;
    do {
      const response = await this.api.meterConsumptionDataGet(
        meterId,
        nextPage,
        startDate,
        endDate
      );
      // console.error("getMeterConsumption", {meterId, nextPage});
      const page = getConsumptionRecordFromMeterData(response.meterData);
      //  console.error({ nextPage, page, length: page.length})
      meterData.push(...page);
      // console.error("getMeterConsumption", { links: response.meterData.links.link })

      const links = response.meterData.links
        ? response.meterData.links.link
        : undefined;
      const nextLink =
        links && links.length > 0
          ? links.find((link) => link["@_linkDescription"] == "next page")
          : undefined;

      const nextLinkUrl = nextLink ? nextLink["@_link"] : undefined;
      const nextPageStr =
        (nextLinkUrl && nextLinkUrl.split("=").pop()) || "NaN";
      nextPage = parseInt(nextPageStr);
    } while (!isNaN(nextPage));
    // console.error("getMeterConsumption", {length: meterData.length})
    return meterData;
    // there are more pages of results for this query
  }

  async getMeterLinks(
    propertyId: number,
    myAccessOnly?: boolean
  ): Promise<ILink[]> {
    const response = await this.api.meterMeterListGet(propertyId, myAccessOnly);
    // console.error("getMeterLinks", {json: JSON.stringify(response), set: !response.response.links?.link  });

    if (response.response["@_status"] != "Ok") {
      throw new Error(
        "Request Error, response: " + JSON.stringify(response, null, 2)
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

  async getMeters(propertyId: number): Promise<IMeter[]> {
    const links = await this.getMeterLinks(propertyId);
    // console.error("getMeters", { links: JSON.stringify(links) })
    const meters = await Promise.all(
      links.map(async (link) => {
        const idStr = link["@_id"] || link["@_link"].split("/").pop() || "";
        const id = parseInt(idStr);
        return await this.getMeter(id);
      })
    );
    return meters;
  }

  async getAssociatedMeters(
    propertyId: number
  ): Promise<IClientMeterPropertyAssociation> {
    const response = await this.api.meterPropertyAssociationGet(propertyId);
    //  console.error('response', {propertyId, response})
    if (!response.meterPropertyAssociationList)
      throw new Error(
        `No associated meters found(${propertyId}):\n ${JSON.stringify(
          response,
          null,
          2
        )}`
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

    // console.error('getAssociatedMeters', {association});
    return association;
  }

  async getMetersPropertiesAssociation(
    propertyIds: number[]
  ): Promise<IClientMeterPropertyAssociation[]> {
    const associationPromises = propertyIds.map(async (propertyId) =>
      this.getAssociatedMeters(propertyId)
    );
    const associationSettlements = await Promise.allSettled(
      associationPromises
    );
    const associations: IClientMeterPropertyAssociation[] = [];
    associationSettlements.forEach((settlement) => {
      settlement.status === "fulfilled"
        ? associations.push(settlement.value)
        : console.error(
            "Error getting meter property association",
            settlement.reason
          );
    });
    return associations;
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

  async getProperty(propertyId: number): Promise<IClientProperty> {
    const response = await this.api.propertyPropertyGet(propertyId);
    if (response.property) {
      // add ID property to returned entity, this makes it easier to use
      // and cross-reference with other entities
      const property = { ...response.property, id: propertyId };
      return property;
    } else
      throw new Error(
        `No property found:\n ${JSON.stringify(response, null, 2)}`
      );
  }

  async getPropertyLinks(accountId?: number): Promise<ILink[]> {
    if (!accountId) accountId = await this.getAccountId();
    const response = await this.api.propertyPropertyListGet(accountId);

    // need to check reponses.links exists since it sometimes returns a string that has a link property that i a function
    // and not a link object
    if (!isIPopulatedResponse(response.response)) {
      // console.log("getPropertyLinks not found", {
      //   links: response.response.links.link,
      // });
      throw new Error(
        `No properties found:\n ${JSON.stringify(response, null, 2)}`
      );
    }
    return response.response.links.link;
  }

  async getProperties(accountId?: number): Promise<IClientProperty[]> {
    if (!accountId) accountId = await this.getAccountId();
    const links = await this.getPropertyLinks(accountId);
    // console.log({ links });
    const properties = await Promise.all(
      links.map(async (link) => {
        const idStr = link["@_id"] || link["@_link"].split("/").pop() || "";
        const id = parseInt(idStr);
        return await this.getProperty(id);
      })
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
    exclude_null = true
  ): Promise<IClientMetric[]> {
    const response = await this.api.propertyMetricsMonthlyGet(
      propertyId,
      year,
      month,
      metrics
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property monthly metrics found:\n ${JSON.stringify(
          response,
          null,
          2
        )}`
      );
    }
    // console.log(JSON.stringify(response, null, 2))
    // to make this more usable with our field selection options, we will flatten the metrics, then select the fields.
    return response.propertyMetrics.metric.reduce<IClientMetric[]>(
      (acc, series) => {
        const name = series["@_name"];
        const uom = series["@_uom"];
        if (!isIPropertyMonthlyMetric(series)) return acc;
        return series.monthlyMetric?.reduce<IClientMetric[]>((acc, monthly) => {
          const value = monthly["value"].hasOwnProperty("@_xsi:nil")
            ? null
            : monthly["value"];
          if (exclude_null && !value) return acc;
          const month = parseInt(monthly["@_month"]);
          const year = parseInt(monthly["@_year"]);
          const metric = { propertyId, name, uom, month, year, value };
          acc.push(metric);
          return acc;
        }, acc);
      },
      []
    );
  }

  async getPropertyMonthlyMetrics2(
    propertyId: number,
    year: number,
    month: number,
    metrics: string[] = [],
    exclude_null = true
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
      metrics
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property metrics found:\n ${JSON.stringify(response, null, 2)}`
      );
    }
    // console.log(JSON.stringify(response, null, 2))
    // to make this more usable with our field selection options, we will flatten the metrics, then select the fields.
    return response.propertyMetrics.metric.reduce<
      Record<string, IClientMetricMonthly>
    >((acc, series) => {
      if (!isIPropertyMonthlyMetric(series)) return acc;
      const name = series["@_name"];
      const uom = series["@_uom"] || "";

      const value = series.monthlyMetric?.reduce<IClientMetricMonthlyValue[]>(
        (monthtlyAcc, monthly) => {
          const monthtlyValue = monthly["value"].hasOwnProperty("@_xsi:nil")
            ? null
            : monthly["value"];
          if (exclude_null && !monthtlyValue) return monthtlyAcc;
          const month = parseInt(monthly["@_month"]);
          const year = parseInt(monthly["@_year"]);
          const metric: IClientMetricMonthlyValue = {
            month,
            year,
            value: monthtlyValue,
          };
          monthtlyAcc.push(metric);
          return monthtlyAcc;
        },
        []
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
    exclude_null = true
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
      metrics
    );
    if (!response.propertyMetrics) {
      throw new Error(
        `No property metrics found:\n ${JSON.stringify(response, null, 2)}`
      );
    }
    // console.log(JSON.stringify(response, null, 2))
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
        if (exclude_null && !value) return acc;
        acc[name] = { propertyId, name, uom, year, month, value };
      }
      return acc;
    }, {});
  }
}
