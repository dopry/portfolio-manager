import { IAudit } from "../common/audit.js";
import { ShareLevel } from "../authorization/ShareLevel.js";

export type MeterUnitsOfMeasure =
  | "ccf (hundred cubic feet)"
  | "cf (cubic feet)"
  | "cGal (hundred gallons) (UK)"
  | "cGal (hundred gallons) (US)"
  | "Cubic Meters per Day"
  | "cm (Cubic meters)"
  | "Cords"
  | "Gallons (UK)"
  | "Gallons (US)"
  | "GJ"
  | "kBtu (thousand Btu)"
  | "kcf (thousand cubic feet)"
  | "Kcm (Thousand Cubic meters)"
  | "KGal (thousand gallons) (UK)"
  | "KGal (thousand gallons) (US)"
  | "Kilogram"
  | "KLbs. (thousand pounds)"
  | "kWh (thousand Watt-hours)"
  | "Liters"
  | "MBtu (million Btu)"
  | "MCF(million cubic feet)"
  | "mg/l (milligrams per liter)"
  | "MGal (million gallons) (UK)"
  | "MGal (million gallons) (US)"
  | "Million Gallons per Day"
  | "MLbs. (million pounds)"
  | "MWh (million Watt-hours)"
  | "pounds"
  | "Pounds per year"
  | "therms"
  | "ton hours"
  | "Tonnes (metric)"
  | "tons";

export type TypeOfMeter =
  | "Coal Anthracite"
  | "Coal Bituminous"
  | "Coke"
  | "Diesel"
  | "District Chilled Water - Absorption Chiller using Natural Gas"
  | "District Chilled Water - Electric-Driven Chiller"
  | "District Chilled Water - Engine-Driven Chiller using Natural Gas"
  | "District Chilled Water - Other"
  | "District Hot Water"
  | "District Steam"
  | "Electric"
  | "Electric on Site Solar"
  | "Electric on Site Wind"
  | "Fuel Oil No 1"
  | "Fuel Oil No 2"
  | "Fuel Oil No 4"
  | "Fuel Oil No 5 or 6"
  | "Kerosene"
  | "Natural Gas"
  | "Other (Energy)"
  | "Propane"
  | "Wood"
  | "IT Equipment Input Energy (meters on each piece of equipment)"
  | "Power Distribution Unit (PDU) Input Energy"
  | "Power Distribution Unit (PDU) Output Energy"
  | "Uninterruptible Power Supply (UPS) Output Energy"
  | "Municipally Supplied Potable Water - Mixed Indoor/Outdoor"
  | "Municipally Supplied Potable Water - Indoor"
  | "Municipally Supplied Potable Water - Outdoor"
  | "Municipally Supplied Reclaimed Water - Mixed Indoor/Outdoor"
  | "Municipally Supplied Reclaimed Water - Indoor"
  | "Municipally Supplied Reclaimed Water - Outdoor"
  | "Other - Mixed Indoor/Outdoor (Water)"
  | "Other - Outdoor"
  | "Other - Indoor"
  | "Average Influent Flow"
  | "Well Water - Mixed Indoor/Outdoor"
  | "Well Water - Indoor"
  | "Well Water - Outdoor";

//A service type used for representing a meter, xml: meterType
export interface IMeter {
  id?: number; // The id of the meter.
  type: TypeOfMeter; // The type of meter (i.e. electric, natural gas, PDU, Indoor, etc.).
  name: string; // The name of the meter. 1-100 characters.
  metered?: boolean; // default: true, Indicates if the meter is set up to be metered monthly or for bulk delivery.
  unitOfMeasure: MeterUnitsOfMeasure; // The units that measure the energy for the meter (Kbtu, KWh, Mbtu, MWh, ccf, gallons, etc.).
  firstBillDate: Date; //The date of the first bill.
  inUse: boolean; // Is this meter in use?
  inactiveDate?: Date; // If the meter is no longer in use, this is the date that it went inactive.
  otherDescription?: string; // 1-100 characters. If the type of meter is "Other," this is the description of the meter's energy type.
  accessLevel?: ShareLevel; // Current share level for the user calling the webservice.
  aggregateMeter?: boolean; // If the meter is aggregate meter or not.
  audit?: IAudit;
}

// xml: wasteMeterType
export type WasteMeterType =
  | "Composted - Cardboard/Corrugated Containers"
  | "Composted - Compostable - Mixed/Other"
  | "Composted - Food/Food Scraps"
  | "Composted - Grass/Yard Trimmings"
  | "Composted - Other"
  | "Composted - Paper - Copy Paper"
  | "Disposed - Appliances"
  | "Disposed - Batteries"
  | "Disposed - Beverage Containers (aluminum, glass, plastic)"
  | "Disposed - Building Materials - Carpet/Carpet Padding"
  | "Disposed - Building Materials - Concrete"
  | "Disposed - Building Materials - Mixed/Other"
  | "Disposed - Building Materials - Steel"
  | "Disposed - Building Materials - Wood"
  | "Disposed - Cardboard/Corrugated Containers"
  | "Disposed - Compostable - Mixed/Other"
  | "Disposed - Electronics"
  | "Disposed - Fats/Oils/Grease"
  | "Disposed - Food/Food Scraps"
  | "Disposed - Furniture"
  | "Disposed - Glass"
  | "Disposed - Grass/Yard Trimmings"
  | "Disposed - Lamps/Light Bulbs"
  | "Disposed - Mixed Recyclables"
  | "Disposed - Office Supplies"
  | "Disposed - Other"
  | "Disposed - Pallets"
  | "Disposed - Paper - Books"
  | "Disposed - Paper - Copy Paper"
  | "Disposed - Paper - Mixed"
  | "Disposed - Plastics - Mixed"
  | "Disposed - Plastics - Wrap/Film"
  | "Disposed - Regulated Medical Waste"
  | "Disposed - Textiles/Clothing"
  | "Disposed - Trash"
  | "Donated/Reused - Appliances"
  | "Donated/Reused - Building Materials - Carpet/Carpet Padding"
  | "Donated/Reused - Building Materials - Concrete"
  | "Donated/Reused - Building Materials - Mixed/Other"
  | "Donated/Reused - Building Materials - Steel"
  | "Donated/Reused - Building Materials - Wood"
  | "Donated/Reused - Cardboard/Corrugated Containers"
  | "Donated/Reused - Electronics"
  | "Donated/Reused - Food/Food Scraps"
  | "Donated/Reused - Furniture"
  | "Donated/Reused - Glass"
  | "Donated/Reused - Office Supplies"
  | "Donated/Reused - Other"
  | "Donated/Reused - Pallets"
  | "Donated/Reused - Paper - Books"
  | "Donated/Reused - Textiles/Clothing"
  | "Recycled - Appliances"
  | "Recycled - Batteries"
  | "Recycled - Beverage Containers (aluminum, glass, plastic)"
  | "Recycled - Building Materials - Carpet/Carpet Padding"
  | "Recycled - Building Materials - Concrete"
  | "Recycled - Building Materials - Mixed/Other"
  | "Recycled - Building Materials - Steel"
  | "Recycled - Building Materials - Wood"
  | "Recycled - Cardboard/Corrugated Containers"
  | "Recycled - Electronics"
  | "Recycled - Fats/Oils/Grease"
  | "Recycled - Glass"
  | "Recycled - Lamps/Light Bulbs"
  | "Recycled - Mixed Recyclables"
  | "Recycled - Other"
  | "Recycled - Pallets"
  | "Recycled - Paper - Books"
  | "Recycled - Paper - Copy Paper"
  | "Recycled - Paper - Mixed"
  | "Recycled - Plastics - Mixed"
  | "Recycled - Plastics - Wrap/Film"
  | "Recycled - Textiles/Clothing";

export type WasteMeterUnitOfMeasure =
  | "pounds"
  | "Kilogram"
  | "tons"
  | "Tonnes (metric)"
  | "Cubic yards"
  | "cm (Cubic meters)"
  | "Gallons (US)"
  | "Gallons (UK)"
  | "Liters";

// xml: typeOfWasteMeter
export interface IWasteMeter {
  id?: number; // The id of the waste meter.
  name: string; // 1-100 characters. The name of the waste meter.
  type: WasteMeterType; // The type of meter (i.e. electric, natural gas, PDU, Indoor, etc.).
  unitOfMeasure: WasteMeterUnitOfMeasure; // The units that measure the energy for the meter (Kbtu, KWh, Mbtu, MWh, ccf, gallons, etc.).
  dataEntryMethod: // The format of meter data entries.
  | "regular" // Indicates that you know the weight or volume of the waste/material.
    | "regular container" // Indicates that you know the size of the bin/dumpster.
    | "intermittent"; // Indicates that the waste/material is collected intermittently or one-time only.
  containerSize?: number; // The size of the container.
  firstBillDate?: Date; //The date of the first bill.
  inUse: boolean; // Is this meter in use?
  inactiveDate?: Date; // If the meter is no longer in use, this is the date that it went inactive.
  accessLevel?: ShareLevel; // Current share level for the user calling the webservice.
  audit?: IAudit;
}
