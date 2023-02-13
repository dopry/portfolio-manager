import { isString } from "type-guards";
import { PortfolioManagerApi } from "./PortfolioManagerApi";
import {
  IAccount,
  IClientConsumption,
  IClientMeter,
  IClientMeterPropertyAssociation,
  IClientProperty,
  ILink,
  IMeter,
  IMeterConsumption,
  IMeterData,
  IMeterDelivery,
  isIDeliveryMeterData,
  isIEmptyResponse,
  isIMeteredMeterData,
  isIPopoulatedResponse,
} from "./types";
import { IClientMeterAssociation } from "./types/client/IClientMeterPropertyAssociation";

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

  async getMeter(meterId: number): Promise<IClientMeter> {
    const response = await this.api.meterMeterGet(meterId);
    if (response.meter) {
      // ensure id is set since it is minOccur 0 in the xsd, and the client guarantees it is set
      const meter = Object.assign({ id: meterId }, response.meter);
      return meter;
    } else
      throw new Error(`No meter found:\n ${JSON.stringify(response, null, 2)}`);
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
    if (isIPopoulatedResponse(response.response)) {
      return response.response.links.link;
    }
    // just some defensive coding in csae the response is not empty or populated
    return [];
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
    // console.log("getPropertyLinks", { response });

    // need to check reponses.links exists since it sometimes returns a string that has a link property that i a function
    // and not a link object
    console.log("getPropertyLinks", {
      links: response.response.links,
      typeofLinks: typeof response.response.links,
      link: response.response.links.link,
      typeOfLink: typeof response.response.links.link,
      stringLink: "".link,
    });
    if (!isString(response.response.links) && response.response.links.link) {
      return response.response.links.link;
    } else
      console.log("getPropertyLinks not found", {
        links: response.response.links.link,
      });
    throw new Error(
      `No properties found:\n ${JSON.stringify(response, null, 2)}`
    );
  }

  async getProperties(accountId?: number): Promise<IClientProperty[]> {
    if (!accountId) accountId = await this.getAccountId();
    const links = await this.getPropertyLinks(accountId);
    if (!links) return [];
    if (!Array.isArray(links)) return [];
    if (links.length == 0) return [];
    if (links.length == 1 && typeof links[0] == "function") {
      console.log("getProperties", { links });
      return [];
    }

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
}
