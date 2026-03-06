import { ILink } from "../common/links.js";
import {
  IMeterConsumption,
  IMeterConsumptionPost,
} from "./IMeterConsumption.js";
import { IMeterDelivery, IMeterDeliveryPost } from "./IMeterDelivery.js";

export interface IDeliveryMeterData extends Omit<IMeterData, "meterDelivery"> {
  meterDelivery: IMeterDelivery[];
}

export interface IMeteredMeterData extends Omit<
  IMeterData,
  "meterConsumption"
> {
  meterConsumption: IMeterConsumption[];
}

export interface IMeterDataPost {
  meterConsumption?: IMeterConsumptionPost[];
  meterDelivery?: IMeterDeliveryPost[];
}

export interface IMeterDataPostRequest {
  meterData: IMeterDataPost;
}

export interface IMeterData {
  meterConsumption?: IMeterConsumption[];
  meterDelivery?: IMeterDelivery[];
  links: { link: ILink[] };
}

export function isIMeteredMeterData(
  meterData: IMeterData,
): meterData is IMeteredMeterData {
  return meterData.meterConsumption !== undefined;
}

export function isIDeliveryMeterData(
  meterData: IMeterData,
): meterData is IDeliveryMeterData {
  return meterData.meterDelivery !== undefined;
}
