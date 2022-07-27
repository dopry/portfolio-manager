import { PortfolioManagerApi } from "./PortfolioManagerApi";
import {
  IAccount,
  IClientProperty,
  ILink,
  IMeter,
  IMeterConsumption,
  IMeterData,
  IMeterDelivery,
  IMeterPropertyAssociationList,
  isIDeliveryMeterData,
  isIMeteredMeterData,
} from "./types";

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

  async getAccount(): Promise<IAccount> {
    const _getAccount = async (): Promise<IAccount> => {
      const response = await this.api.accountAccountGet();
      if (response.account) return response.account;
      else {
        this._accountPromise = undefined;
        throw new Error(
          `No account found:\n ${JSON.stringify(response, null, 2)}`
        );
      }
    };
    if (!this._accountPromise) {
      this._accountPromise = _getAccount();
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

  async getMeter(meterId: number): Promise<IMeter> {
    const response = await this.api.meterMeterGet(meterId);
    if (response.meter) return response.meter;
    else
      throw new Error(`No meter found:\n ${JSON.stringify(response, null, 2)}`);
  }

  async getMeterConsumption(
    meterId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<(IMeterDelivery | IMeterConsumption)[]> {
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
      throw new Error("Unable to determine meter consumption type to return");
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
    let nextPage: number | undefined = undefined;
    do {
      const response = await this.api.meterConsumptionDataGet(
        meterId,
        nextPage,
        startDate,
        endDate
      );
      const page = getConsumptionRecordFromMeterData(response.meterData);
      meterData.push(...page);
      // console.log("getMeterConsumption", response.meterData.links)

      const links = (response.meterData.links) ? response.meterData.links.link : undefined
      const nextLink = (links && links.length > 0) ? links[0]["@_link"] : undefined;
      const nextPageStr: string = nextLink && nextLink.split("=").pop() || "NaN Please"
      nextPage = parseInt(nextPageStr) || undefined;
    } while (nextPage);
    return meterData;
    // there are more pages of results for this query
  }

  async getMeterLinks(
    propertyId: number,
    myAccessOnly?: boolean
  ): Promise<ILink[]> {
    const response = await this.api.meterMeterListGet(
      propertyId,
      myAccessOnly
    );
    if (!response.response.links?.link)
      throw new Error(
        `No meters found:\n ${JSON.stringify(response, null, 2)}`
      );

    return response.response.links.link;
  }

  async getMeters(propertyId: number): Promise<IMeter[]> {
    const links = await this.getMeterLinks(propertyId);
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
  ): Promise<IMeterPropertyAssociationList> {
    const response = await this.api.meterPropertyAssociationGet(
      propertyId
    );
    // console.log('getAssociatedMeters', {response});
    if (!response.meterPropertyAssociationList)
      throw new Error(
        `No associated meters found:\n ${JSON.stringify(response, null, 2)}`
      );

    return response.meterPropertyAssociationList;
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
    if (response.response.links.link) return response.response.links.link;
    else
      throw new Error(
        `No properties found:\n ${JSON.stringify(response, null, 2)}`
      );
  }

  async getProperties(accountId?: number): Promise<IClientProperty[]> {
    if (!accountId) accountId = await this.getAccountId();
    const links = await this.getPropertyLinks(accountId);
    const properties = await Promise.all(
      links.map(async (link) => {
        const idStr = link["@_id"] || link["@_link"].split("/").pop() || "";
        const id = parseInt(idStr);
        return await this.getProperty(id);
      })
    );
    return properties;
  }
}
