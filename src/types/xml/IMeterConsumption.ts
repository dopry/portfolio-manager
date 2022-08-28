import { IAudit } from "./IAudit";

type GenerationPlantType = "" | number;
type OptionalCost = "" | number;
type OptionalDemand = "" | number;

export interface IDemandTrackingType {
  demand?: OptionalDemand;
  demandCost?: OptionalCost;
}

export interface IMeterConsumption {
  id: number;
  "@_estimatedValue"?: boolean;
  "@_isGreenPower"?: boolean;
  startDate: Date;
  endDate: Date;
  usage: number;
  cost?: OptionalCost;
  energyExportedOffSite?: number;
  greenPower?: GreenPowerType;
  // For Onsite Solar or Onsite Wind energy, whether the RECs have been retained by the property owner.
  RECOwnership?: "Owned" | "Sold" | "Arbitrage";
  demandTracking?: IDemandTrackingType;
  audit: IAudit;
}

export function isIMeterConsumption(
  meter: IMeterConsumption
): meter is IMeterConsumption {
  return (
    meter.hasOwnProperty("startDate") &&
    meter.hasOwnProperty("endDate") &&
    meter.hasOwnProperty("usage")
  );
}

export interface GreenPowerType {
  value?: number;
  sources?: {
    biomassPct: number;
    biogasPct: number;
    geothermalPct: number;
    smallHydroPct: number;
    solarPct: number;
    windPct: number;
    unknownPct: number;
  };
  generationLocation?: {
    // The plant code of the power plant where the green power is generated.
    generationPlant?: GenerationPlantType;
    // The eGrid subregion code of where the green power is generated.
    eGridSubRegion?: string;
    // The location of the green power is unknown.
    unknown?: string;
  };
}
