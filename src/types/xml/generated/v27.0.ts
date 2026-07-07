// GENERATED FILE — do not edit by hand.
// Regenerate with `npm run generate:xml` after updating xml-schemas/.
// TypeScript mirror of ESPM schema version 27.0, following the
// runtime fast-xml-parser conventions (attributes as "@_"-prefixed
// strings, repeatable elements as arrays).

export type OccupancyType = number;

export type PlantDesignFlowRateUnitsType =
  "Million Gallons per Day" | "Cubic Meters per Day";

/** The response to the sharing request */
export type AcceptRejectType = "Accept" | "Reject";

export type AllEnergyMetersType =
  | "Electric"
  | "Electric on Site Solar"
  | "Electric on Site Wind"
  | "Natural Gas"
  | "Propane"
  | "Diesel"
  | "District Steam"
  | "District Hot Water"
  | "District Chilled Water - Absorption Chiller using Natural Gas"
  | "District Chilled Water - Electric-Driven Chiller"
  | "District Chilled Water - Engine-Driven Chiller using Natural Gas"
  | "District Chilled Water - Other"
  | "Fuel Oil No 1"
  | "Fuel Oil No 2"
  | "Fuel Oil No 4"
  | "Fuel Oil No 5 or 6"
  | "Coal Anthracite"
  | "Coal Bituminous"
  | "Coke"
  | "Wood"
  | "Kerosene"
  | "Other (Energy)";

export type AllMeterTypes =
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
  | "Well Water - Outdoor"
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

export type AmountOfLaundryProcessedAnnuallyUnitsType =
  "pounds" | "Kilogram" | "short tons";

export type BaselineDateType = "System Determined" | string;

/** List of categories or stages for the project. */
export type CategoryType =
  | "Recommissioning (Stage 1)"
  | "Lighting (Stage 2)"
  | "Load Reductions (Stage 3)"
  | "Fan Systems (Stage 4)"
  | "Heating & Cooling Plant (Stage 5)"
  | "Behavioral/Outreach"
  | "Other Technologies/Strategies";

export type ConstructionStatusType = "Existing" | "Project" | "Test";

export type CostType = number;

export type CountryCode = "US" | "CA" | "";

export type CountryList =
  | "US"
  | "AD"
  | "AE"
  | "AF"
  | "AG"
  | "AI"
  | "AL"
  | "AM"
  | "AO"
  | "AQ"
  | "AR"
  | "AT"
  | "AU"
  | "AW"
  | "AX"
  | "AZ"
  | "BA"
  | "BB"
  | "BD"
  | "BE"
  | "BF"
  | "BG"
  | "BH"
  | "BI"
  | "BJ"
  | "BL"
  | "BM"
  | "BN"
  | "BO"
  | "BQ"
  | "BR"
  | "BS"
  | "BT"
  | "BV"
  | "BW"
  | "BY"
  | "BZ"
  | "CA"
  | "CC"
  | "CD"
  | "CF"
  | "CG"
  | "CH"
  | "CI"
  | "CK"
  | "CL"
  | "CM"
  | "CN"
  | "CO"
  | "CR"
  | "CU"
  | "CV"
  | "CW"
  | "CX"
  | "CY"
  | "CZ"
  | "DE"
  | "DJ"
  | "DK"
  | "DM"
  | "DO"
  | "DZ"
  | "EC"
  | "EE"
  | "EG"
  | "EH"
  | "ER"
  | "ES"
  | "ET"
  | "FI"
  | "FJ"
  | "FK"
  | "FM"
  | "FO"
  | "FR"
  | "GA"
  | "GB"
  | "GD"
  | "GE"
  | "GF"
  | "GG"
  | "GH"
  | "GI"
  | "GL"
  | "GM"
  | "GN"
  | "GP"
  | "GQ"
  | "GR"
  | "GS"
  | "GT"
  | "GW"
  | "GY"
  | "HK"
  | "HM"
  | "HN"
  | "HR"
  | "HT"
  | "HU"
  | "ID"
  | "IE"
  | "IL"
  | "IM"
  | "IN"
  | "IO"
  | "IQ"
  | "IR"
  | "IS"
  | "IT"
  | "JE"
  | "JM"
  | "JO"
  | "JP"
  | "KE"
  | "KG"
  | "KH"
  | "KI"
  | "KM"
  | "KN"
  | "KP"
  | "KR"
  | "KW"
  | "KY"
  | "KZ"
  | "LA"
  | "LB"
  | "LC"
  | "LI"
  | "LK"
  | "LR"
  | "LS"
  | "LT"
  | "LU"
  | "LV"
  | "LY"
  | "MA"
  | "MC"
  | "MD"
  | "ME"
  | "MF"
  | "MG"
  | "MK"
  | "ML"
  | "MM"
  | "MN"
  | "MO"
  | "MQ"
  | "MR"
  | "MS"
  | "MT"
  | "MU"
  | "MV"
  | "MW"
  | "MX"
  | "MY"
  | "MZ"
  | "NA"
  | "NC"
  | "NE"
  | "NF"
  | "NG"
  | "NI"
  | "NL"
  | "NO"
  | "NP"
  | "NR"
  | "NU"
  | "NZ"
  | "OM"
  | "PA"
  | "PE"
  | "PF"
  | "PG"
  | "PH"
  | "PK"
  | "PL"
  | "PM"
  | "PN"
  | "PS"
  | "PT"
  | "PW"
  | "PY"
  | "QA"
  | "RE"
  | "RO"
  | "RS"
  | "RU"
  | "RW"
  | "SA"
  | "SB"
  | "SC"
  | "SD"
  | "SE"
  | "SG"
  | "SH"
  | "SI"
  | "SJ"
  | "SK"
  | "SL"
  | "SM"
  | "SN"
  | "SO"
  | "SR"
  | "SS"
  | "ST"
  | "SV"
  | "SX"
  | "SY"
  | "SZ"
  | "TC"
  | "TD"
  | "TF"
  | "TG"
  | "TH"
  | "TJ"
  | "TK"
  | "TL"
  | "TM"
  | "TN"
  | "TO"
  | "TR"
  | "TT"
  | "TV"
  | "TW"
  | "TZ"
  | "UA"
  | "UG"
  | "UY"
  | "UZ"
  | "VA"
  | "VC"
  | "VE"
  | "VG"
  | "VN"
  | "VU"
  | "WF"
  | "WS"
  | "YE"
  | "YT"
  | "ZA"
  | "ZM"
  | "ZW";

export type CustomUnitsType =
  | "Feet"
  | "Gallons (US)"
  | "Gallons (UK)"
  | "Kilogram"
  | "Meters"
  | "Tonnes (metric)"
  | "Other"
  | "Pounds"
  | "Square Feet"
  | "Square Meters"
  | "Tons (short)"
  | "Therms"
  | "kWh (thousand Watt-hours)";

/** The status of the Data Request. */
export type DataRequestStatusType = "OPEN" | "CLOSED" | "ALL";

export type DataType = "date" | "numeric" | "string";

export type DecimalPrecision = number;

export type DecimalTwoPrecision = number;

export type DecimalTwoPrecisionOrEmptyString = number | "";

export type DesignUnitOfMeasure =
  | "ccf (hundred cubic feet)"
  | "cf (cubic feet)"
  | "cm (Cubic meters)"
  | "Cords"
  | "eKWh (Equivalent Kilowatt hour)"
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

export type EmptyString = "";

export type EmptyType = "";

export type EnergyUomType =
  | "GJ"
  | "kBtu (thousand Btu)"
  | "kWh (thousand Watt-hours)"
  | "MBtu (million Btu)"
  | "MWh (million Watt-hours)";

export type GenerationPlantType = "" | number;

export type GreenPowerFuelSourceEnum =
  | "Biogas"
  | "Biomass"
  | "Geothermal"
  | "Small Hydropower"
  | "Solar"
  | "Wind"
  | "Other";

export type GreenPowerTypeEnum =
  | "Community Choice Aggregation"
  | "Community Solar"
  | "Competitive Product (direct purchase)"
  | "Financial/Virtual PPA"
  | "Physical PPA"
  | "Unbundled RECs"
  | "Utility Green Tariff"
  | "Utility Product"
  | "Unknown";

export type GrossFloorAreaUnitsType = "Square Feet" | "Square Meters";

export type IrrigationAreaUnitsType =
  "Square Feet" | "Square Meters" | "Acres" | "";

export type LengthUnitsType = "Feet" | "Meters";

export type MeterCategoryType = "ENERGY" | "WATER" | "WASTE";

export type NoNegativePrecision = number;

export type OptionalCost = "" | number;

export type OptionalDemand = "" | number;

export type OptionalWasteCost = "" | number;

export type PercentDecimalPrecision = number;

export type PercentageType = number;

export type PeriodType = "CURRENT" | "BASELINE";

export type PrimaryBusinessType =
  | "Architecture/Design Firm"
  | "Banking/Financial"
  | "Commercial Real Estate"
  | "Congregation/Faith-Based Organization"
  | "Data Center"
  | "Drinking Water Treatment/Distribution"
  | "Education"
  | "Energy Efficiency Program"
  | "Entertainment/Recreation"
  | "Food Service"
  | "Government: Local (U.S.)"
  | "Government: Outside U.S."
  | "Government: State (U.S.)"
  | "Government: Federal (U.S.)"
  | "Healthcare"
  | "Hospitality"
  | "Legal Services"
  | "Manufacturing/Industrial"
  | "Media"
  | "Multifamily Housing"
  | "Retail"
  | "Senior Care"
  | "Service and Product Provider/Consultant"
  | "Transportation"
  | "Utility"
  | "Wastewater Treatment"
  | "Other";

export type PrimaryFunctionType =
  | "Adult Education"
  | "Ambulatory Surgical Center"
  | "Aquarium"
  | "Bank Branch"
  | "Bar/Nightclub"
  | "Barracks"
  | "Bowling Alley"
  | "Casino"
  | "CEGEP"
  | "College/University"
  | "Community Center and Social Meeting Hall"
  | "Convenience Store with Gas Station"
  | "Convenience Store without Gas Station"
  | "Convention Center"
  | "Courthouse"
  | "Data Center"
  | "Distribution Center"
  | "Drinking Water Treatment & Distribution"
  | "Electric Vehicle Charging Station"
  | "Enclosed Mall"
  | "Energy/Power Station"
  | "Fast Food Restaurant"
  | "Financial Office"
  | "Fire Station"
  | "Fitness Center/Health Club/Gym"
  | "Food Sales"
  | "Food Service"
  | "Hospital (General Medical & Surgical)"
  | "Hotel"
  | "Ice/Curling Rink"
  | "Indoor Arena"
  | "K-12 School"
  | "Laboratory"
  | "Library"
  | "Lifestyle Center"
  | "Mailing Center/Post Office"
  | "Manufacturing/Industrial Plant"
  | "Medical Office"
  | "Mixed Use Property"
  | "Movie Theater"
  | "Multifamily Housing"
  | "Museum"
  | "Non-Refrigerated Warehouse"
  | "Office"
  | "Other - Education"
  | "Other - Entertainment/Public Assembly"
  | "Other - Lodging/Residential"
  | "Other - Mall"
  | "Other - Public Services"
  | "Other - Recreation"
  | "Other - Restaurant/Bar"
  | "Other - Services"
  | "Other - Stadium"
  | "Other - Technology/Science"
  | "Other - Utility"
  | "Other"
  | "Other/Specialty Hospital"
  | "Outpatient Rehabilitation/Physical Therapy"
  | "Parking"
  | "Performing Arts"
  | "Personal Services (Health/Beauty, Dry Cleaning, etc)"
  | "Police Station"
  | "Pre-school/Daycare"
  | "Prison/Incarceration"
  | "Race Track"
  | "Refrigerated Warehouse"
  | "Vehicle Repair Services"
  | "Residence Hall/Dormitory"
  | "Residential Care Facility"
  | "Restaurant"
  | "Retail Store"
  | "Roller Rink"
  | "Self-Storage Facility"
  | "Senior Living Community"
  | "Single Family Home"
  | "Stadium (Closed)"
  | "Stadium (Open)"
  | "Strip Mall"
  | "Supermarket/Grocery Store"
  | "Swimming Pool"
  | "Transportation Terminal/Station"
  | "Urgent Care/Clinic/Other Outpatient"
  | "Vehicle Dealership"
  | "Veterinary Office"
  | "Vocational School"
  | "Wastewater Treatment Plant"
  | "Wholesale Club/Supercenter"
  | "Worship Facility"
  | "Zoo";

export type PropertyUseNameType = string;

export type RatedCapacityUomType = "kW" | "MW";

export type RecOwnershipEnum =
  "Owned" | "Not Owned/Sold" | "Arbitraged" | "Unknown";

export type RenewableGenerationTechnologyEnum =
  | "Solar PV- Carports"
  | "Solar PV- Ground-mounted"
  | "Solar PV- Rooftop"
  | "Solar Thermal- Concentrating Solar Power"
  | "Other";

/** The report status. */
export type ReportStatusType =
  | "INITIALIZED"
  | "SUBMITTED"
  | "IN_PROCESS"
  | "FAILED"
  | "GENERATED"
  | "READY_FOR_DOWNLOAD"
  | "GENERATED_WITH_ERRORS"
  | "SENT";

/** The type of report. */
export type ReportType = "CUSTOM" | "ENERGY_STAR";

/** The interval of the timeframe (monthly, quarterly, or annual). Only applies to certain timeframes. */
export type ReportingIntervalType = "MONTHLY" | "QUARTERLY" | "YEARLY";

/** The sharing level */
export type ShareLevelType = "Read" | "Read Write";

export type StateCode =
  | "AK"
  | "AL"
  | "AR"
  | "AS"
  | "AZ"
  | "CA"
  | "CO"
  | "CT"
  | "DC"
  | "DE"
  | "FL"
  | "GA"
  | "GU"
  | "HI"
  | "IA"
  | "ID"
  | "IL"
  | "IN"
  | "KS"
  | "KY"
  | "LA"
  | "MA"
  | "MD"
  | "ME"
  | "MH"
  | "MI"
  | "MN"
  | "MO"
  | "MP"
  | "MS"
  | "MT"
  | "NC"
  | "ND"
  | "NE"
  | "NH"
  | "NJ"
  | "NM"
  | "NN"
  | "NV"
  | "NY"
  | "OH"
  | "OK"
  | "OR"
  | "PA"
  | "PI"
  | "PR"
  | "RI"
  | "SC"
  | "SD"
  | "TN"
  | "TT"
  | "TX"
  | "UM"
  | "UT"
  | "VA"
  | "VI"
  | "VT"
  | "WA"
  | "WI"
  | "WQ"
  | "WV"
  | "WY"
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "QC"
  | "SK"
  | "YT";

export type StatusType = "Ok" | "Error";

export type SystemDeterminedString = "System Determined";

export type TargetTypePercentageValuesType = number;

export type TargetTypeScoreValuesType = number;

/** Lists of energy uses for the Combination of Tenant and Common Area Consumption metering configuration. At least one must be selected. (Added 11/2011). */
export type TenantCommonAreaEnergyType =
  | "Tenant Heating"
  | "Tenant Cooling"
  | "Tenant Hot Water"
  | "Tenant Plug Load/Electricity"
  | "Common Area Heating"
  | "Common Area Cooling"
  | "Common Area Hot Water"
  | "Common Area Plug Load/Electricity";

export type TypeOfEnergyStarPartner =
  | "Associations"
  | "Organizations that Own/Manage/Lease Buildings and Plants"
  | "Service and Product Providers"
  | "Small Businesses"
  | "Utilities and Energy Efficiency Program Sponsors"
  | "Other";

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

export type YesNo = "Yes" | "No";

export interface AgencyType {
  /** The ID created within Portfolio Manager that uniquely defines the federal agency. */
  "@_id"?: string;
  /** The federal agency code or abbreviation. */
  "@_code"?: string;
  /** The federal agency name. */
  "@_name"?: string;
  /** The country which owns this agency. */
  "@_country"?: string;
}

export interface PlantDesignFlowRateType extends UseAttributeBase {
  "@_units": string;
  value: number;
}

export interface AccountType {
  /** The ID to the account. This is ignored if specified in a XML request. This is provided by Portfolio Manager only in a XML response. */
  id?: number;
  /** Your username. */
  username: string;
  /** Your password. The password must be at least 8 characters in length and must contain 3 out of 4 of the following requirements: (i) uppercase characters, (ii) lowercase characters, (iii) base 10 digits (0 through 9), and (iv) nonalphanumeric characters: ~!@#$%^&*_-+=`|\(){}[]:;"'<>,.?/ */
  password: string;
  contact: ContactType;
  organization: OrganizationType;
  /** Whether you will be using web services. */
  webserviceUser: boolean;
  /** Whether you want people to be able to search for you. */
  searchable: boolean;
  /** Indicates whether properties marked as “Test Properties” in the account will be included in the charts and graphs on My Portfolio page. */
  includeTestPropertiesInGraphics?: boolean;
  /** This setting ONLY applies to accounts belonging to Canada. NRCAN (Natural Resources of Canada) can contact you with training opportunities, tool updates, program news and other information about the ENERGY STAR program. */
  emailPreferenceCanadianAccount?: boolean;
  /** Your saved billboard metric */
  billboardMetric?: string;
  languagePreference?: "en_US" | "fr_CA" | "es_US";
}

export interface AddressType {
  /** The property physical address - line 1. */
  "@_address1": string;
  /** The property physical address - line 2. */
  "@_address2"?: string;
  /** The property physical address - city. */
  "@_city": string;
  /** The property physical address - county. */
  "@_county"?: string;
  /** The property physical address - postal code/zip code. */
  "@_postalCode": string;
  /** The property physical address - state or province. */
  "@_state"?: string;
  /** The property physical address - state or province (when not US/Canada). */
  "@_otherState"?: string;
  /** The property physical address - country. */
  "@_country": string;
}

export interface AlertsType {
  /** The year of the period ending date provided. */
  "@_year"?: string;
  /** The month of the period ending date provided. */
  "@_month"?: string;
  /** The id of the property. */
  "@_propertyId"?: string;
  alert?: { name: string; description: string }[];
}

export interface AmountOfLaundryProcessedAnnuallyType extends UseAttributeBase {
  "@_units": string;
  value?: number;
}

export interface AnnualResearchExpenditureType extends UseAttributeBase {
  value?:
    | "Less than 2.5 million"
    | "2.5 million to 5 million"
    | "5 million to 50 million"
    | "Greater than 50 million";
}

export interface BankBranchType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfComputers?: UseDecimalType;
    percentOfficeCooled?: PercentOfficeCooledType;
    percentOfficeHeated?: PercentOfficeHeatedType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface BarracksType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    hasComputerLab?: UseYesNoType;
    hasDiningHall?: UseYesNoType;
    numberOfRooms?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface BaselineAndTargetType {
  baseline?: BaselineType;
  target?: PerformanceTargetType;
}

export interface BaselineType {
  /** The baseline date used for your property's energy consumption. Must be in the format of YYYY-MM or "System Determined" to indicate for Portfolio Manager to automatically calculate the baseline date. */
  energyBaselineDate?: "System Determined" | string;
  /** The baseline date used for your property's water consumption. Must be in the format of YYYY-MM or "System Determined" to indicate for Portfolio Manager to automatically calculate the baseline date. */
  waterBaselineDate?: "System Determined" | string;
}

/** Settings to your billboard metric */
export interface BillboardMetricType {
  /** The name of the metric. */
  "@_name"?: string;
  /** The data type of the value for the metric (i.e., string, numeric, date). */
  "@_dataType"?: string;
}

/** List of billboard metrics that can be used. */
export interface BillboardMetricsType {
  /** Displays metric information. */
  metric: BillboardMetricType[];
}

export interface BowlingAlley {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface CegepType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfFullTimeStudentsEnrolledSeptemberToDecember?: UseDecimalType;
    numberOfFullTimeStudentsEnrolledJanuaryToApril?: UseDecimalType;
    numberOfFullTimeStudentsEnrolledMayToAugust?: UseDecimalType;
    annualResearchExpenditure?: AnnualResearchExpenditureType;
    percentOfLabFloorArea?: UseIntegerType;
    highestAwardLevel?: HighestAwardLevelType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    enrollment?: UseDecimalType;
    grantDollars?: UseDecimalType;
    numberOfFTEWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface CeilingHeightUnitsType extends UseAttributeBase {
  "@_units": string;
  value?: number;
}

export interface ClearHeightUnitsType extends UseAttributeBase {
  "@_units": string;
  value?: number;
}

export interface CollegeUniversityType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfFullTimeStudentsEnrolledSeptemberToDecember?: UseDecimalType;
    numberOfFullTimeStudentsEnrolledJanuaryToApril?: UseDecimalType;
    numberOfFullTimeStudentsEnrolledMayToAugust?: UseDecimalType;
    annualResearchExpenditure?: AnnualResearchExpenditureType;
    percentOfLabFloorArea?: UseIntegerType;
    highestAwardLevel?: HighestAwardLevelType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    enrollment?: UseDecimalType;
    grantDollars?: UseDecimalType;
    numberOfFTEWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface CommunityCenterAndSocialMeetingHall {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface ContactType {
  /** Your first name */
  firstName: string;
  /** Your last name */
  lastName: string;
  /** Your email address */
  email: string;
  address: AddressType;
  jobTitle: string;
  phone: string;
}

export interface ConvenienceStoreWithGasStationType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingFacilities?: UseYesNoType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    numberOfFTEWorkers?: UseDecimalType;
    numberOfCookingEquipmentUnits?: UseIntegerType;
    numberOfWarmingHeatingEquipmentUnits?: UseIntegerType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    singleStore?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
  };
  audit?: LogType;
}

export interface ConvenienceStoreWithoutGasStationType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingFacilities?: UseYesNoType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    numberOfFTEWorkers?: UseDecimalType;
    numberOfCookingEquipmentUnits?: UseIntegerType;
    numberOfWarmingHeatingEquipmentUnits?: UseIntegerType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    singleStore?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
  };
  audit?: LogType;
}

export interface CoolingEquipmentRedundancyType extends UseAttributeBase {
  value?: "N" | "N+1" | "N+2" | "2N" | "Greater than 2N" | "None of the Above";
}

export interface CourthouseType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfComputers?: UseDecimalType;
    percentOfficeCooled?: PercentOfficeCooledType;
    percentOfficeHeated?: PercentOfficeHeatedType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface CustomUseDetailsType extends UseAttributeBase {
  "@_units"?: string;
  "@_dataType"?: string;
  value?: string;
  customName?: string;
  customUom?: string;
}

export interface CustomUseType {
  name: string;
  useDetails: {
    customUseDetail1?: CustomUseDetailsType;
    customUseDetail2?: CustomUseDetailsType;
  };
  audit?: LogType;
}

export interface DataCenterType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    estimatesApplied?: UseYesNoType;
    coolingEquipmentRedundancy?: CoolingEquipmentRedundancyType;
    itEnergyMeterConfiguration?: ItEnergyConfigurationType;
    upsSystemRedundancy?: UpsSystemRedundancyType;
  };
  audit?: LogType;
}

export interface DataRequest {
  /** The unique identifier of the data request. */
  "@_id"?: string;
  /** The name of the data request. */
  name: string;
  /** The main point of contact for this data request. */
  requesterDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  /** The details instructions of the data request. */
  instructions?: string;
  /** The timeframe of the data request. */
  timeframe?: TimeframeType;
  /** The locations of the data request. */
  locations?: { location: { "@_country"?: string; "@_state"?: string }[] };
  /** The status (OPEN or CLOSED) of the data request. */
  dataRequestStatus: "OPEN" | "CLOSED" | "ALL";
  /** The user who accepted the data request. */
  dataRequestAcceptedBy?: string;
  /** The date when the data request was accepted. */
  dataRequestAcceptedDate?: string;
}

export interface DataResponse {
  /** The unique identifier of the data response. */
  "@_id"?: string;
  /** The id of the corresponding data request. */
  dataRequestId?: number;
  /** The timeframe the data response will be run against. */
  timeframe?: TimeframeType;
  /** The list of properties that the data response will be run for. */
  properties?: { id?: number[] };
}

export interface DemandTrackingType {
  /** Demand amount */
  demand?: "" | number;
  /** Demand cost */
  demandCost?: "" | number;
}

export interface DesignBaseType {
  /** Most property use characteristics XML attributes (the id, currentAsOf, and temporary) are not applicable and will be ignored if provided. */
  propertyUses: {
    prison?: OtherType[];
    refrigeratedWarehouse?: RefrigeratedWarehouseType[];
    retail?: RetailType[];
    hospital?: HospitalType[];
    medicalOffice?: MedicalOfficeType[];
    dataCenter?: DataCenterType[];
    courthouse?: CourthouseType[];
    singleFamilyHome?: SingleFamilyHomeType[];
    nonRefrigeratedWarehouse?: NonRefrigeratedWarehouseType[];
    multifamilyHousing?: MultifamilyHousingType[];
    office?: OfficeType[];
    wholesaleClubSupercenter?: WholesaleClubSupercenterType[];
    selfStorageFacility?: SelfStorageFacilityType[];
    seniorLivingCommunity?: SeniorLivingCommunityType[];
    residentialCareFacility?: ResidentialCareFacilityType[];
    swimmingPool?: SwimmingPoolType[];
    residenceHallDormitory?: ResidenceHallDormitoryType[];
    wastewaterTreatmentPlant?: WastewaterTreatmentPlantType[];
    distributionCenter?: DistributionCenterType[];
    worshipFacility?: WorshipFacilityType[];
    financialOffice?: FinancialOfficeType[];
    drinkingWaterTreatmentAndDistribution?: DrinkingWaterTreatmentAndDistributionType[];
    parking?: ParkingType[];
    supermarket?: SupermarketType[];
    barracks?: BarracksType[];
    hotel?: HotelType[];
    k12School?: K12SchoolType[];
    bankBranch?: BankBranchType[];
    cegep?: CegepType[];
    collegeUniversity?: CollegeUniversityType[];
    indoorArena?: IndoorArenaType[];
    otherStadium?: OtherStadiumType[];
    stadiumClosed?: StadiumClosedType[];
    stadiumOpen?: StadiumOpenType[];
    manufacturingIndustrialPlant?: ManufacturingIndustrialPlantType[];
    ambulatorySurgicalCenter?: OtherType[];
    bowlingAlley?: BowlingAlley[];
    otherPublicServices?: OtherType[];
    otherLodgingResidential?: OtherType[];
    casino?: OtherType[];
    personalServices?: OtherType[];
    mailingCenterPostOffice?: MailingCenterPostOfficeType[];
    library?: LibraryType[];
    otherSpecialityHospital?: OtherType[];
    conventionCenter?: OtherType[];
    veterinaryOffice?: OtherType[];
    urgentCareClinicOtherOutpatient?: OtherType[];
    energyPowerStation?: OtherType[];
    otherServices?: OtherType[];
    barNightclub?: OtherType[];
    otherUtility?: OtherType[];
    zoo?: OtherType[];
    vehicleDealership?: VehicleDealershipType[];
    museum?: MuseumType[];
    otherRecreation?: OtherType[];
    otherRestaurantBar?: OtherType[];
    lifestyleCenter?: OtherType[];
    policeStation?: OtherType[];
    preschoolDaycare?: PreschoolDaycareType[];
    raceTrack?: OtherType[];
    fastFoodRestaurant?: FastFoodRestaurantType[];
    laboratory?: OtherType[];
    convenienceStoreWithoutGasStation?: ConvenienceStoreWithoutGasStationType[];
    vehicleRepairServices?: VehicleRepairServicesType[];
    otherTechnologyScience?: OtherType[];
    fireStation?: FireStationType[];
    foodSales?: FoodSalesType[];
    performingArts?: OtherType[];
    outpatientRehabilitationPhysicalTherapy?: OtherType[];
    stripMall?: OtherType[];
    rollerRink?: OtherType[];
    otherEducation?: OtherType[];
    fitnessCenterHealthClubGym?: FitnessCenterHealthClubGym[];
    aquarium?: OtherType[];
    foodService?: OtherType[];
    restaurant?: RestaurantType[];
    enclosedMall?: OtherType[];
    iceCurlingRink?: IceCurlingRinkType[];
    adultEducation?: OtherType[];
    otherEntertainmentPublicAssembly?: OtherType[];
    movieTheater?: OtherType[];
    transportationTerminalStation?: OtherType[];
    vocationalSchool?: OtherType[];
    communityCenterAndSocialMeetingHall?: CommunityCenterAndSocialMeetingHall[];
    otherMall?: OtherType[];
    convenienceStoreWithGasStation?: ConvenienceStoreWithGasStationType[];
    other?: OtherType[];
    electricVehicleChargingStation?: EvChargingStationType[];
  };
  /** The planned average daily flow for a Water Treatment and Distribution Plant. This value must be specified if one of the property uses is of the type Water Distribution. */
  drinkingWaterInfluentFlow?: number;
  /** The planned average daily flow of water through a Wastewater Treatment Plant. This value must be specified if one of the property uses is of the type Waste Water Treatment Plant. */
  wasteWaterInfluentFlow?: number;
  /** The amount of energy required by the server racks, storage silos, and other IT equipment in the Data Center at the output of UPS. This value must be specified if one of the property uses is of the type Data Center. */
  itSiteEnergy?: number;
  /** If you can estimate how much energy your design property will use annually, provide it here to receive a score (if available) and energy metrics for your design. You can then use these metrics to compare to your target and/or property's operation (in the future). To get the most accurate metrics, provide estimates for total annual energy from each potential energy source. */
  estimatedEnergyList?: { entries: EstimatedEnergyListType };
  /** The Design Target can be either ENERGY STAR Score or "% Better than Median." */
  target: {
    targetTypeScore?: TargetTypeScoreType;
    targetTypePercentage?: TargetTypePercentageType;
  };
}

/** A service type used for representing a disposal destination entry. */
export interface DisposalDestinationType {
  /** The percentage of the quantity that was disposed at a land fill. */
  landfillPercentage?: number;
  /** The percentage of the quantity that was disposed by incineration. */
  incinerationPercentage?: number;
  /** The percentage of the quantity that was disposed at a waste to energy facility. */
  wasteToEnergyPercentage?: number;
  /** The percentage of the quantity disposed in another way or when the disposal method is unknown. */
  unknownDestPercentage?: number;
}

export interface DistributionCenterType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    percentUsedForColdStorage?: UseIntegerType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    clearHeight?: ClearHeightUnitsType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface DrinkingWaterTreatmentAndDistributionType {
  name: string;
  useDetails: { totalGrossFloorArea: GrossFloorAreaType };
  audit?: LogType;
}

export interface EnergyMeterAssocAndConfigType {
  meters: MeterListType;
  /** Indication of what energy is covered by the energy meters you associate together for calculations */
  propertyRepresentation: {
    propertyRepresentationType:
      | "Whole Property"
      | "Common Area Energy Consumption Only"
      | "Tenant Energy Consumption Only"
      | "Combination of Tenant and Common Area Consumption"
      | "Other"
      | "No Selection Made";
    tenantCommonAreaEnergyUseList?: TenantCommonAreaEnergyUseInformationType;
    propertyRepresentationTypeOtherDesc?: string;
  };
}

export interface EnergyPerformanceProjectType {
  /** The name of the energy performance project. */
  projectName?: string;
  /** The description of the energy performance project. */
  projectDescription?: string;
  /** The id to the corresponding property. This field is ignore if provided on a PUT or POST. */
  propertyId?: number;
  /** The name of the corresponding property. This field is ignore if provided on a PUT or POST. */
  propertyName?: string;
  /** The date the project is going to be or was implemented. */
  implementationDate?: string;
  /** Indicates the category or stage the project fits within. */
  category?:
    | "Recommissioning (Stage 1)"
    | "Lighting (Stage 2)"
    | "Load Reductions (Stage 3)"
    | "Fan Systems (Stage 4)"
    | "Heating & Cooling Plant (Stage 5)"
    | "Behavioral/Outreach"
    | "Other Technologies/Strategies";
  /** If the category type is "Other," then an additional description is required. */
  categoryOtherDescription?: string;
  /** The cost of the project (investment). */
  investmentCost?: number;
  /** The estimated cost savings of the project. */
  estimatedSavingsCost?: number;
  /** Providing evaluation periods will allow Portfolio Manager to show you energy metrics before and after you implemented your project. By default, these periods are set to one month prior to and 13 months after your implementation date. */
  evaluationPeriod?: EvaluationPeriodType;
  audit?: LogType;
}

export interface ErrorType {
  /** The number of the error. */
  "@_errorNumber"?: string;
  /** The description of the error. */
  "@_errorDescription"?: string;
}

/** A list of errors that caused this request to fail. */
export interface ErrorsType {
  /** The error of the web service call. */
  error?: ErrorType[];
}

export interface EstimatedEnergyListType {
  designEntry?: EstimatedEnergyType[];
}

export interface EstimatedEnergyType {
  energyType:
    | "Electric"
    | "Electric on Site Solar"
    | "Electric on Site Wind"
    | "Natural Gas"
    | "Propane"
    | "Diesel"
    | "District Steam"
    | "District Hot Water"
    | "District Chilled Water - Absorption Chiller using Natural Gas"
    | "District Chilled Water - Electric-Driven Chiller"
    | "District Chilled Water - Engine-Driven Chiller using Natural Gas"
    | "District Chilled Water - Other"
    | "Fuel Oil No 1"
    | "Fuel Oil No 2"
    | "Fuel Oil No 4"
    | "Fuel Oil No 5 or 6"
    | "Coal Anthracite"
    | "Coal Bituminous"
    | "Coke"
    | "Wood"
    | "Kerosene"
    | "Other (Energy)";
  energyUnit:
    | "ccf (hundred cubic feet)"
    | "cf (cubic feet)"
    | "cm (Cubic meters)"
    | "Cords"
    | "eKWh (Equivalent Kilowatt hour)"
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
  estimatedAnnualEnergyUsage: number;
  /** The energy rate is the price of energy per unit. This is the price. If provided, you must also provide the energyRateCostUnit. */
  energyRateCost?: number;
  /** The energy rate is the price of energy per unit. This is the unit. If provided, you must also provide the energyRateCost. */
  energyRateCostUnit?:
    | "ccf (hundred cubic feet)"
    | "cf (cubic feet)"
    | "cm (Cubic meters)"
    | "Cords"
    | "eKWh (Equivalent Kilowatt hour)"
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
}

export interface EvChargingStationType {
  name: string;
  useDetails: {
    numberOfLevelOneEvChargingStations?: UseDecimalType;
    numberOfLevelTwoEvChargingStations?: UseDecimalType;
    numberOfDcFastEvChargingStations?: UseDecimalType;
  };
  audit?: LogType;
}

export interface EvaluationPeriodType {
  /** The date the project is going to be or was implemented. */
  preImplementationDate?: string;
  /** The date the project is going to be or was implemented. */
  postImplementationDate?: string;
}

export interface FastFoodRestaurantType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingLocatedOnsite?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    lengthOfAllCommercialKitchenHoods?: LengthOfUseDetailType;
  };
  audit?: LogType;
}

export interface FinancialOfficeType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfComputers?: UseDecimalType;
    percentOfficeCooled?: PercentOfficeCooledType;
    percentOfficeHeated?: PercentOfficeHeatedType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface FireStationType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfComputers?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfFTEWorkers?: UseDecimalType;
    numberOfEmergencyVehicles?: UseDecimalType;
    numberOfAnnualEmergencyIncidents?: UseDecimalType;
    weeklyBuildingOccupiedHours?: UseDecimalType;
  };
  audit?: LogType;
}

export interface FitnessCenterHealthClubGym {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface FloorAreaTypeBase extends UseAttributeBase {
  /** The units of the Gross Floor Area (Square Foot or Square Meter). */
  "@_units": string;
}

export interface FoodSalesType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingFacilities?: UseYesNoType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    singleStore?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
  };
  audit?: LogType;
}

export interface GenerationLocationType {
  /** The location of the green power is unknown. */
  unknown?: string;
  /** The postal code where the green power is generated. */
  postalCode?: string;
  /** The eGrid subregion code of where the green power is generated. */
  eGridSubRegion?: string;
}

/** The total gross floor area of all buildings at the property, measured at the exterior boundary of the enclosing walls, including all areas within the building (common, tenant, maintenance, etc). */
export interface GrossFloorAreaType extends FloorAreaTypeBase {
  value: number;
}

export interface HeyType {
  propertyInfo: {
    postalCode: string;
    numberOfOccupants: number;
    grossFloorArea: GrossFloorAreaType;
  };
  meter: {
    type:
      | "Electric"
      | "Electric on Site Solar"
      | "Electric on Site Wind"
      | "Natural Gas"
      | "Propane"
      | "Diesel"
      | "District Steam"
      | "District Hot Water"
      | "District Chilled Water - Absorption Chiller using Natural Gas"
      | "District Chilled Water - Electric-Driven Chiller"
      | "District Chilled Water - Engine-Driven Chiller using Natural Gas"
      | "District Chilled Water - Other"
      | "Fuel Oil No 1"
      | "Fuel Oil No 2"
      | "Fuel Oil No 4"
      | "Fuel Oil No 5 or 6"
      | "Coal Anthracite"
      | "Coal Bituminous"
      | "Coke"
      | "Wood"
      | "Kerosene"
      | "Other (Energy)";
    unitOfMeasure:
      | "ccf (hundred cubic feet)"
      | "cf (cubic feet)"
      | "cm (Cubic meters)"
      | "Cords"
      | "eKWh (Equivalent Kilowatt hour)"
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
    meterData: { meterConsumption: MeterConsumptionType[] };
  }[];
}

export interface HierarchyType {
  /** Id of the Property Data Administrator */
  accountId?: number;
  /** Username of the Property Data Administrator */
  username?: string;
  /** Id of the property */
  propertyId?: number;
  /** Id of the property use */
  propertyUseId?: number;
  /** Id of the use detail record */
  useDetailId?: number;
  /** Id of the meter */
  meterId?: number;
  /** Id of the consumption data record */
  consumptionDataId?: number;
  /** Id of the waste meter data record */
  wasteMeterDataId?: number;
}

export interface HighestAwardLevelType extends UseAttributeBase {
  value?:
    | "Doctoral Degree"
    | "Master's Degree"
    | "Bachelor's Degree"
    | "Associate's degree or other 2-3 year program"
    | "Other program less than 2 years";
}

export interface HospitalType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    licensedBedCapacity?: UseDecimalType;
    numberOfStaffedBeds?: UseDecimalType;
    numberOfFTEWorkers?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfMriMachines?: UseDecimalType;
    numberOfSterilizationUnits?: UseDecimalType;
    onSiteLaundryFacility?: UseYesNoType;
    hasLaboratory?: UseYesNoType;
    isTertiaryCare?: UseYesNoType;
    maximumNumberOfFloors?: UseIntegerType;
    ownedBy?: OwnedByType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

/** This xml type represents a property use type. If an element is missing it will be populated with a default value. */
export interface HotelType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    fullServiceSpaFloorArea?: OptionalFloorAreaType;
    gymCenterFloorArea?: OptionalFloorAreaType;
    hoursPerDayGuestsOnsite?: HoursPerDayGuestsOnsiteType;
    numberOfCommercialRefrigerationUnits?: UseDecimalType;
    numberOfGuestMealsServedPerYear?: UseIntegerType;
    numberOfHotelRooms?: UseDecimalType;
    laundryFacility?: OnsiteLaundryType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    cookingFacilities?: UseYesNoType;
    amountOfLaundryProcessedAnnually?: AmountOfLaundryProcessedAnnuallyType;
    numberOfWorkers?: UseDecimalType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    grossFloorAreaHotelConferenceSpace?: OptionalFloorAreaType;
  };
  audit?: LogType;
}

export interface HoursPerDayGuestsOnsiteType extends UseAttributeBase {
  value?: "Less Than 15" | "15 To 19" | "More Than 20";
}

export interface IceCurlingRinkType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfIndoorIceRinks?: UseIntegerType;
    totalIceRinkSurfaceAreaForAllRinks?: OptionalFloorAreaType;
    monthsMainIndoorIceRinkInUse?: MonthsInUseType;
    numberOfWeeklyIceResurfacingForAllRinks?: NumberOfWeeklyIceResurfacingType;
    numberOfFTEWorkers?: UseDecimalType;
    numberOfCurlingSheets?: UseIntegerType;
    spectatorSeatingCapacity?: UseDecimalType;
  };
  audit?: LogType;
}

export interface IndoorArenaType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    enclosedFloorArea?: OptionalFloorAreaType;
    numberOfSportingEventsPerYear?: UseIntegerType;
    numberOfConcertShowEventsPerYear?: UseIntegerType;
    numberOfSpecialOtherEventsPerYear?: UseIntegerType;
    sizeOfElectronicScoreBoards?: OptionalFloorAreaType;
    iceEvents?: UseYesNoType;
    numberOfComputers?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

/** Irrigated area is the amount of outdoor vegetated area that is supplied water regularly, measured in square feet, square meters, or acres. */
export interface IrrigationAreaType extends IrrigationAreaTypeBase {
  value?: number | "";
}

export interface IrrigationAreaTypeBase {
  /** Specifies whether to use the default value for Irrigated Area. Only applicable for Multi-Family Housing. */
  "@_default"?: string;
  /** The units of the Irrigated Area (Square Foot, Square Meter, or Acres). */
  "@_units": string;
}

export interface ItEnergyConfigurationType extends UseAttributeBase {
  value?:
    | "UPS Supports Only IT Equipment"
    | "UPS Include Non IT Load Less Than 10%"
    | "UPS Include Non-IT Load Greater Than 10% Load Submetered"
    | "UPS Include Non IT Load Greater Than 10% Load Not Submetered"
    | "Facility Has No UPS"
    | "No IT Energy Configuration Selected";
}

export interface K12SchoolType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    openOnWeekends?: UseYesNoType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    numberOfComputers?: UseDecimalType;
    cookingFacilities?: UseYesNoType;
    isHighSchool?: UseYesNoType;
    monthsInUse?: MonthsInUseType;
    schoolDistrict?: UseStringType;
    studentSeatingCapacity?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    gymnasiumFloorArea?: OptionalFloorAreaType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
  };
  audit?: LogType;
}

export interface LengthOfUseDetailType extends UseAttributeBase {
  "@_units": string;
  value?: number;
}

export interface LibraryType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    numberOfComputers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface LinkType {
  /** Indicates the unique Portfolio Manager identifier used to define this entity. */
  "@_id"?: string;
  /** The description of the link. */
  "@_linkDescription"?: string;
  /** The URL to a web service call for subsequent processing. */
  "@_link"?: string;
  /** The HTTP method to the web service call. */
  "@_httpMethod"?: string;
  /** A brief description of the information returned from the link. */
  "@_hint"?: string;
}

export interface LinksType {
  link?: LinkType[];
}

export interface LogType {
  /** The username of the user who created the record. This information is only available in an XML response. */
  createdBy?: string;
  /** The id of the user who created the record. This information is only available in an XML response. */
  createdByAccountId?: number;
  /** The date and time stamp the record was created (in EST). This information is only available in an XML response. */
  createdDate?: string;
  /** The username of the user who performed the last update. This information is only available in an XML response. */
  lastUpdatedBy?: string;
  /** The id of the user who performed the last update. This information is only available in an XML response. */
  lastUpdatedByAccountId?: number;
  /** The date and time stamp of the last update (in EST). This information is only available in an XML response. */
  lastUpdatedDate?: string;
}

export interface MailingCenterPostOfficeType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfLettersPackagesPerYear?: UseIntegerType;
    deliveryFacility?: UseYesNoType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface ManufacturingIndustrialPlantType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    plantType: PlantDataType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface MappingType {
  /** The id of the account, property, or meter needed to reference a customer, property, or meter for a given external identifier from ABS 2.5. */
  id?: number;
}

export interface MedicalOfficeType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfWorkers?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfSurgicalOperatingBeds?: UseDecimalType;
    surgeryCenterFloorArea?: OptionalFloorAreaType;
    numberOfMriMachines?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
  };
  audit?: LogType;
}

/** A service type used for representing a meter consumption entry */
export interface MeterConsumptionType {
  /** Whether the meter consumption is an estimated value. */
  "@_estimatedValue"?: string;
  /** The id of the meter consumption entry. */
  id?: number;
  /** The first date of the meter consumption reading. */
  startDate: string;
  /** The last date of the meter consumption reading. */
  endDate: string;
  /** The quantity of the meter consumption. */
  usage: number;
  /** The cost of meter's consumption. */
  cost?: "" | number;
  /** The amount of energy exported off site from an on-site solar or on-site wind installation. */
  energyExportedOffSite?: number;
  /** The percentage that is renewable Natural Gas. */
  percentRenewableNaturalGas?: number;
  demandTracking?: DemandTrackingType;
  audit?: LogType;
}

/** A service type used for getting and receiving meter consumption data */
export interface MeterDataType {
  /** Consumption data used for a meter that is set up to be metered. */
  meterConsumption?: MeterConsumptionType[];
  meterDelivery?: MeterDeliveryType[];
  links?: LinksType;
}

/** Delivery data used for a meter that is set up for bulk delivery. */
export interface MeterDeliveryType {
  "@_estimatedValue"?: string;
  /** The id of the meter delivery entry. */
  id?: number;
  /** Indicates the date of the delivery. */
  deliveryDate: string;
  /** Indicates the quantity of energy delivered. */
  quantity: number;
  /** Indicates the cost associated with the energy delivered. */
  cost?: "" | number;
  audit?: LogType;
}

export interface MeterListType {
  /** Id of the meter to associate to the specific property or property use. */
  meterId?: number[];
}

export interface MeterPropertyAssociationListType {
  energyMeterAssociation?: EnergyMeterAssocAndConfigType;
  waterMeterAssociation?: WaterMeterAssocAndConfigType;
  wasteMeterAssociation?: WasteMeterAssocAndConfigType;
}

/** A service type used for representing a meter */
export interface MeterType {
  /** The id of the meter. */
  id?: number;
  /** The type of meter (i.e. electric, natural gas, PDU, Indoor, etc.). */
  type:
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
  /** The name of the meter. */
  name: string;
  /** Indicates if the meter is set up to be metered monthly or for bulk delivery. */
  metered?: boolean;
  /** The units that measure the energy for the meter (Kbtu, KWh, Mbtu, MWh, ccf, gallons, etc.). */
  unitOfMeasure:
    | "ccf (hundred cubic feet)"
    | "cf (cubic feet)"
    | "cGal (hundred gallons) (UK)"
    | "cGal (hundred gallons) (US)"
    | "Cubic Meters per Day"
    | "cm (Cubic meters)"
    | "Cords"
    | "eKWh (Equivalent Kilowatt hour)"
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
  /** The date of the first bill. */
  firstBillDate: string;
  /** Is this meter in use? */
  inUse: boolean;
  /** If the meter is no longer in use, this is the date that it went inactive. */
  inactiveDate?: string;
  /** If the type of meter is "Other," this is the description of the meter's energy type. */
  otherDescription?: string;
  /** Current share level for the user calling the webservice. */
  accessLevel?: "Read" | "Read Write";
  /** If the meter is aggregate meter or not. */
  aggregateMeter?: boolean;
  audit?: LogType;
}

export interface Metric {
  /** The name of the metric. */
  "@_name"?: string;
  /** The id of the metric. */
  "@_id"?: string;
  /** The unit of measure of the metric. */
  "@_uom"?: string;
  /** The data type of the value for the metric (i.e., string, numeric, date). */
  "@_dataType"?: string;
  /** Indicates whether the metric is automatically generated by the system. */
  "@_autoGenerated"?: string;
  /** The value of the Monthly metric. */
  monthlyMetric?: ReportMetricValuesWs[];
  /** The value of the Non-Monthly metric. */
  value?: string;
}

export interface MonthsInUseType extends UseAttributeBase {
  value?: number;
}

export interface MonthsSchoolInUseType extends UseAttributeBase {
  value?: number;
}

export interface MultifamilyHousingType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfResidentialLivingUnits?: UseDecimalType;
    numberOfBedrooms?: UseDecimalType;
    numberOfResidentialLivingUnitsMidRiseSetting?: UseDecimalType;
    numberOfLaundryHookupsInAllUnits?: UseIntegerType;
    numberOfLaundryHookupsInCommonArea?: UseIntegerType;
    numberOfResidentialLivingUnitsLowRiseSetting?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    numberOfResidentialLivingUnitsHighRiseSetting?: UseDecimalType;
    residentPopulation?: ResidentPopulationType;
    governmentSubsidizedHousing?: UseYesNoType;
    commonEntrance?: UseYesNoType;
  };
  audit?: LogType;
}

export interface MuseumType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfWorkers?: UseDecimalType;
    precisionControlsForTemperatureAndHumidity?: UseYesNoType;
    grossFloorAreaThatIsExhibitSpace?: OptionalFloorAreaType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    numberOfComputers?: UseDecimalType;
    weeklyOperatingHours?: UseDecimalType;
  };
  audit?: LogType;
}

export interface NonRefrigeratedWarehouseType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    percentUsedForColdStorage?: UseIntegerType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    clearHeight?: ClearHeightUnitsType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface NotificationListType {
  notification?: NotificationType[];
}

export interface NotificationType {
  /** The notification type code of the notification. */
  notificationTypeCode: string;
  /** The id number of the notification. */
  notificationId: number;
  /** The description of the notification. */
  description: string;
  /** The id number of the account to the corresponding notification. */
  accountId?: number;
  /** The username of the Portfolio Manager Account to the corresponding notification. */
  username: string;
  /** The id number of the property to the corresponding notification. */
  propertyId?: number;
  /** The id number of the meter to the corresponding notification. */
  meterId?: number;
  notificationCreatedDate?: string;
  /** The account name of the user who created the corresponding notification. */
  notificationCreatedBy?: string;
  /** The account id of the user who created the corresponding notification. */
  notificationCreatedByAccountId?: string;
}

export interface NumberOfWeekdaysType extends UseAttributeBase {
  value?: number;
}

export interface NumberOfWeeklyIceResurfacingType extends UseAttributeBase {
  value?: number;
}

export interface OfficeType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    percentOfficeCooled?: PercentOfficeCooledType;
    percentOfficeHeated?: PercentOfficeHeatedType;
  };
  audit?: LogType;
}

export interface OffsiteGreenPowerPurchaseType {
  /** The id of the offsite green power purchase. */
  id?: number;
  /** You must own and retire the RECs (or have them retired on your behalf) for them to count as green power in Portfolio Manager. */
  recOwnedAndRetired: boolean;
  /** The start date of the offsite green power purchase. */
  startDate: string;
  /** The end date of the offsite green power purchase. */
  endDate: string;
  amountPurchased: {
    quantity?: { "@_uom": string; amount: number };
    percentage?: {
      value: number;
      includeAllMeters: boolean;
      meters?: { id?: number[] };
    };
  };
  /** Flag to indicate if any of the amount purchased is estimate. */
  estimate: boolean;
  /** The location (power plant, eGrid subregion, or unknown) of where the green power was generated. */
  generationLocation: GenerationLocationType;
  /** The green power type of the offsite green power purchase. */
  type:
    | "Community Choice Aggregation"
    | "Community Solar"
    | "Competitive Product (direct purchase)"
    | "Financial/Virtual PPA"
    | "Physical PPA"
    | "Unbundled RECs"
    | "Utility Green Tariff"
    | "Utility Product"
    | "Unknown";
  /** You must attest that the unbundled RECs meet the vintage requirement when type is Unbundled RECs. */
  meetVintageRequirement?: boolean;
  /** Flag indicate whether this green power is certified by Green-e. */
  certifiedByGreene: boolean;
  /** The green power provider/project owner. */
  provider?: string;
  /** The generation facility name. */
  facilityName?: string;
  /** The green power fuel sources. */
  fuelSources?: {
    fuelSource?: {
      type:
        | "Biogas"
        | "Biomass"
        | "Geothermal"
        | "Small Hydropower"
        | "Solar"
        | "Wind"
        | "Other";
      percentage?: number;
    }[];
  };
  /** The Renewable Generation Technology types. */
  renewableGenerationTechnologies?: {
    technology?: (
      | "Solar PV- Carports"
      | "Solar PV- Ground-mounted"
      | "Solar PV- Rooftop"
      | "Solar Thermal- Concentrating Solar Power"
      | "Other"
    )[];
  };
  /** The rated capacity of project/offtake. */
  ratedCapacity?: { "@_uom": string; value: number };
  /** The commercial operation date. */
  operationDate?: string;
  /** The contract start date. */
  contractStartDate?: string;
  /** The contract start date. */
  contractEndDate?: string;
  /** The cost of Green Power purchase. */
  cost?: { "@_uom": string; value: number };
  /** Any other information about this purchase. */
  notes?: string;
  audit?: LogType;
}

export interface OnsiteLaundryType extends UseAttributeBase {
  value?:
    | "Linens only"
    | "Terry only"
    | "Both linens and terry"
    | "No laundry facility";
}

export interface OnsiteRenewableDetailType {
  /** The id of the onsite renewable detail. */
  id?: number;
  /** The time period of the onsite renewable detail. */
  currentAsOf: string;
  /** The energy used onsite REC ownership details. */
  energyUsedOnsite: OnsiteUsageDetailType;
  /** The energy exported to grid REC ownership details. */
  energyExportedToGrid: OnsiteUsageDetailType;
  audit?: LogType;
}

export interface OnsiteRenewableOptionalInfoType {
  /** The project name. */
  projectName?: string;
  /** The Renewable Generation Technology types. */
  renewableGenerationTechnologies?: {
    technology?: (
      | "Solar PV- Carports"
      | "Solar PV- Ground-mounted"
      | "Solar PV- Rooftop"
      | "Solar Thermal- Concentrating Solar Power"
      | "Other"
    )[];
  };
  /** The rated capacity of project/offtake. */
  ratedCapacity?: { "@_uom": string; value: number };
  /** The commercial operation date. */
  operationDate?: string;
  /** The number of inverters. */
  numberOfInverters?: number;
  /** The number of solar panels. */
  numberOfSolarPanels?: number;
  /** the total investment cost of the project in $. */
  totalCost?: number;
  /** The amount of incentives or rebates obtained for the project in $. */
  incentiveOrRebateAmount?: number;
  /** The estimated cost savings of the project in $. */
  estimatedSavings?: number;
  /** Any other information about the renewable energy. */
  notes?: string;
  audit?: LogType;
}

export interface OnsiteUsageDetailType {
  /** The REC ownership type. */
  recOwnership: "Owned" | "Not Owned/Sold" | "Arbitraged" | "Unknown";
  /** The generation location of the REC, required when recOwnership is Arbitraged. Defaults to property's facility location when recOwnership is Owned. Not applicable when recOwnership is Not Owned/Sold or Unknown. */
  generationLocation?: GenerationLocationType;
  /** The green power type, required when the recOwnership is Arbitraged, not applicable for other recOwnership types. */
  greenPowerType?:
    | "Community Choice Aggregation"
    | "Community Solar"
    | "Competitive Product (direct purchase)"
    | "Financial/Virtual PPA"
    | "Physical PPA"
    | "Unbundled RECs"
    | "Utility Green Tariff"
    | "Utility Product"
    | "Unknown";
  /** You must attest that the unbundled RECs meet the vintage requirement when green power type is Unbundled RECs. */
  meetVintageRequirement?: boolean;
  /** Flag indicate if certified by Green-e, required when the recOwnership is Arbitraged, not applicable for other recOwnership types. */
  certifiedByGreene?: boolean;
}

export interface OptionalFloorAreaType extends FloorAreaTypeBase {
  value?: number;
}

export interface OrganizationType {
  /** Your Organization's name. */
  "@_name"?: string;
  /** Your primary business. */
  primaryBusiness:
    | "Architecture/Design Firm"
    | "Banking/Financial"
    | "Commercial Real Estate"
    | "Congregation/Faith-Based Organization"
    | "Data Center"
    | "Drinking Water Treatment/Distribution"
    | "Education"
    | "Energy Efficiency Program"
    | "Entertainment/Recreation"
    | "Food Service"
    | "Government: Local (U.S.)"
    | "Government: Outside U.S."
    | "Government: State (U.S.)"
    | "Government: Federal (U.S.)"
    | "Healthcare"
    | "Hospitality"
    | "Legal Services"
    | "Manufacturing/Industrial"
    | "Media"
    | "Multifamily Housing"
    | "Retail"
    | "Senior Care"
    | "Service and Product Provider/Consultant"
    | "Transportation"
    | "Utility"
    | "Wastewater Treatment"
    | "Other";
  /** Describes other if you chose other as your primary business. */
  otherBusinessDescription?: string;
  /** Whether organization is an ENERGY STAR Partner. */
  energyStarPartner: boolean;
  /** Whether organization is an ENERGY STAR SPP Partner. Only required if the organization is an ENERGY STAR Partner. */
  energyStarPartnerType?:
    | "Associations"
    | "Organizations that Own/Manage/Lease Buildings and Plants"
    | "Service and Product Providers"
    | "Small Businesses"
    | "Utilities and Energy Efficiency Program Sponsors"
    | "Other";
  /** Describes other if you chose other as your energy star partner. */
  otherPartnerDescription?: string;
}

export interface OtherStadiumType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    enclosedFloorArea?: OptionalFloorAreaType;
    numberOfSportingEventsPerYear?: UseIntegerType;
    numberOfConcertShowEventsPerYear?: UseIntegerType;
    numberOfSpecialOtherEventsPerYear?: UseIntegerType;
    sizeOfElectronicScoreBoards?: OptionalFloorAreaType;
    iceEvents?: UseYesNoType;
    numberOfComputers?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface OtherType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface OwnedByType extends UseAttributeBase {
  value?: "For Profit" | "Non Profit" | "Governmental";
}

export interface ParkingType {
  name: string;
  useDetails: {
    supplementalHeating?: UseYesNoType;
    openFootage: GrossFloorAreaType;
    completelyEnclosedFootage: GrossFloorAreaType;
    partiallyEnclosedFootage: GrossFloorAreaType;
  };
  audit?: LogType;
}

export interface Ped {
  month: number;
  year: number;
}

export interface PendingAccountsType {
  /** The id of the Portfolio Manager Account requesting to connect with you. */
  accountId: number;
  /** The username of the Portfolio Manager Account requesting to connect with you. */
  username: string;
  customFieldList?: { customField?: { "#text"?: string; "@_name"?: string }[] };
  accountInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: AddressType;
    jobTitle: string;
    phone: string;
    organization?: string;
  };
  connectionAudit?: LogType;
}

export interface PendingListType {
  /** Indicates a pending connection request and detailed information. */
  account?: PendingAccountsType[];
  /** Indicates a pending property share request and detailed information. */
  property?: PendingPropertiesType[];
  /** Indicates a pending meter share request and detailed information */
  meter?: PendingMetersType[];
  links?: LinksType;
}

export interface PendingMetersType {
  /** The id of the meter. */
  meterId: number;
  /** The id of the corresponding property. */
  propertyId: number;
  /** The id to the account requesting the meter share. */
  accountId: number;
  /** The username of the Portfolio Manager Account requesting the meter share. */
  username: string;
  customFieldList?: { customField?: { "#text"?: string; "@_name"?: string }[] };
  /** The level of access for the meter share request: Read or Read Write */
  accessLevel: "Read" | "Read Write";
  propertyInfo: PropertyType;
  meterInfo?: MeterType;
  wasteMeterInfo?: TypeOfWasteMeter;
  shareAudit?: LogType;
}

export interface PendingPropertiesType {
  /** The ID number of the property. */
  propertyId: number;
  customFieldList?: { customField?: { "#text"?: string; "@_name"?: string }[] };
  /** The level of access for the property share request: Read or Read Write. */
  accessLevel: "Read" | "Read Write";
  /** The id to the account requesting the property share. */
  accountId: number;
  /** The username of the Portfolio Manager Account requesting the property share. */
  username: string;
  propertyInfo: PropertyType;
  shareAudit?: LogType;
}

export interface PercentCooledType extends UseAttributeBase {
  value?:
    "0" | "10" | "20" | "30" | "40" | "50" | "60" | "70" | "80" | "90" | "100";
}

export interface PercentHeatedType extends UseAttributeBase {
  value?:
    "0" | "10" | "20" | "30" | "40" | "50" | "60" | "70" | "80" | "90" | "100";
}

export interface PercentOfficeCooledType extends UseAttributeBase {
  value?: "50% or more" | "Less than 50%" | "Not Air Conditioned";
}

export interface PercentOfficeHeatedType extends UseAttributeBase {
  value?: "50% or more" | "Less than 50%" | "Not Heated";
}

export interface PerformanceTargetType {
  /** Target metric option */
  targetMetric:
    | "No Target"
    | "Target ENERGY STAR Score"
    | "Target % Better than Baseline"
    | "Target % Better than Median";
  /** Target metric value used for the selected target metric. This is not required if a "No Target" metric is selected. For target metric options of "Target % Better than Baseline" and "Target % Better than Median", the valid range is 0-100. For "Target ENERGY STAR Score", the valid range is 1-100. */
  targetValue?: number;
}

export interface PlantDataType extends UseAttributeBase {
  value?:
    | "Aerospace and defense"
    | "Durable assembled products - Electronics"
    | "Durable assembled products - Electrical components and appliances"
    | "Durable assembled products - Furniture"
    | "Durable assembled products - Machinery (HVAC, boilers, turbines, pumps, etc.)"
    | "Durable assembled products - Other"
    | "Food Manufacturing - Animal food"
    | "Food Manufacturing - Animal processing"
    | "Food Manufacturing - Bread and roll"
    | "Food Manufacturing - Brewery"
    | "Food Manufacturing - Cookies and cracker"
    | "Food Manufacturing - Dairy"
    | "Food Manufacturing - Distillery"
    | "Food Manufacturing - Frozen fried potato"
    | "Food Manufacturing - Fruit and vegetable canning"
    | "Food Manufacturing - Juices"
    | "Food Manufacturing - Sugar"
    | "Food Manufacturing - Wet corn milling"
    | "Food Manufacturing - Other"
    | "Paper - Paper mill"
    | "Paper - Pulp mill"
    | "Paper - Integrated pulp and paper mill"
    | "Paper - Recycled paper mill"
    | "Paper - Other"
    | "Medical equipment"
    | "Personal care"
    | "Pharmaceutical"
    | "Printing"
    | "Mining and extraction"
    | "Petroleum and chemicals - Asphalt paving and roofing"
    | "Petroleum and chemicals - Chlor-alkyl"
    | "Petroleum and chemicals - Ethylene"
    | "Petroleum and chemicals - Fertilizer-Nitrogenous"
    | "Petroleum and chemicals - Fertilizer-Other"
    | "Petroleum and chemicals - Industrial gases"
    | "Petroleum and chemicals - Petroleum refining"
    | "Petroleum and chemicals - Other"
    | "Plastic and rubber products"
    | "Cement"
    | "Concrete"
    | "Composite Manufacturing"
    | "Glass - Flat"
    | "Glass - Container"
    | "Glass - Other"
    | "Gypsum (wallboard, molding, etc.)"
    | "Lime"
    | "Metals - Aluminum processing"
    | "Metals - Steel mill"
    | "Metals - Metal Machining and Fabrication"
    | "Metals - Metal casting"
    | "Metals - Metal Finishing/Coating"
    | "Metals - Tool and Die Manufacturing"
    | "Metals - Other"
    | "Motor Vehicle - Assembly"
    | "Motor Vehicle - Transmission"
    | "Motor Vehicle - Engine"
    | "Motor Vehicle - Tire Manufacturing"
    | "Motor Vehicle - Other"
    | "Textiles Manufacturing"
    | "Wood"
    | "Other";
  textValue?: string;
}

export interface PoolSizeType extends UseAttributeBase {
  value?:
    | "Recreational (20 yards x 15 yards)"
    | "Short Course (25 yards x 20 yards)"
    | "Olympic (50 meters x 25 meters)";
}

export interface PoolType extends UseAttributeBase {
  value?: "Indoor" | "Outdoor";
}

export interface PreschoolDaycareType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface PropertyDesignType {
  /** The name of the property. */
  name: string;
  /** The primary function of the property. */
  primaryFunction:
    | "Adult Education"
    | "Ambulatory Surgical Center"
    | "Aquarium"
    | "Bank Branch"
    | "Bar/Nightclub"
    | "Barracks"
    | "Bowling Alley"
    | "Casino"
    | "CEGEP"
    | "College/University"
    | "Community Center and Social Meeting Hall"
    | "Convenience Store with Gas Station"
    | "Convenience Store without Gas Station"
    | "Convention Center"
    | "Courthouse"
    | "Data Center"
    | "Distribution Center"
    | "Drinking Water Treatment & Distribution"
    | "Electric Vehicle Charging Station"
    | "Enclosed Mall"
    | "Energy/Power Station"
    | "Fast Food Restaurant"
    | "Financial Office"
    | "Fire Station"
    | "Fitness Center/Health Club/Gym"
    | "Food Sales"
    | "Food Service"
    | "Hospital (General Medical & Surgical)"
    | "Hotel"
    | "Ice/Curling Rink"
    | "Indoor Arena"
    | "K-12 School"
    | "Laboratory"
    | "Library"
    | "Lifestyle Center"
    | "Mailing Center/Post Office"
    | "Manufacturing/Industrial Plant"
    | "Medical Office"
    | "Mixed Use Property"
    | "Movie Theater"
    | "Multifamily Housing"
    | "Museum"
    | "Non-Refrigerated Warehouse"
    | "Office"
    | "Other - Education"
    | "Other - Entertainment/Public Assembly"
    | "Other - Lodging/Residential"
    | "Other - Mall"
    | "Other - Public Services"
    | "Other - Recreation"
    | "Other - Restaurant/Bar"
    | "Other - Services"
    | "Other - Stadium"
    | "Other - Technology/Science"
    | "Other - Utility"
    | "Other"
    | "Other/Specialty Hospital"
    | "Outpatient Rehabilitation/Physical Therapy"
    | "Parking"
    | "Performing Arts"
    | "Personal Services (Health/Beauty, Dry Cleaning, etc)"
    | "Police Station"
    | "Pre-school/Daycare"
    | "Prison/Incarceration"
    | "Race Track"
    | "Refrigerated Warehouse"
    | "Vehicle Repair Services"
    | "Residence Hall/Dormitory"
    | "Residential Care Facility"
    | "Restaurant"
    | "Retail Store"
    | "Roller Rink"
    | "Self-Storage Facility"
    | "Senior Living Community"
    | "Single Family Home"
    | "Stadium (Closed)"
    | "Stadium (Open)"
    | "Strip Mall"
    | "Supermarket/Grocery Store"
    | "Swimming Pool"
    | "Transportation Terminal/Station"
    | "Urgent Care/Clinic/Other Outpatient"
    | "Vehicle Dealership"
    | "Veterinary Office"
    | "Vocational School"
    | "Wastewater Treatment Plant"
    | "Wholesale Club/Supercenter"
    | "Worship Facility"
    | "Zoo";
  /** The Gross Floor Area of the property. The id, currentAsOf, and temporary XML attributes are not applicable and will be ignored if provided. It is not needed by Target Finder. */
  grossFloorArea: GrossFloorAreaType;
  /** The year planned for construction completion. */
  plannedConstructionCompletionYear: number;
  address: AddressType;
  /** The estimated number of buildings for this property. Please note that this is only for informational purposes. */
  numberOfBuildings: number;
}

export interface PropertyMetricsList {
  /** All metrics reflect the 12 months ending on the given month and year. */
  propertyMetrics?: PropertyMetricsType[];
}

export interface PropertyMetricsType {
  /** The year of the period ending date for the set of metrics. */
  "@_year"?: string;
  /** The month of the period ending date for the set of metrics. */
  "@_month"?: string;
  /** The predefined period type used to generate the report metric */
  "@_periodType"?: string;
  /** The id of the property. */
  "@_propertyId"?: string;
  metric?: Metric[];
}

export interface PropertyType {
  /** The name of the property. */
  name?: string;
  /** The construction status (either existing, design or test project). */
  constructionStatus?: "Existing" | "Project" | "Test";
  /** The primary function of the building. */
  primaryFunction?:
    | "Adult Education"
    | "Ambulatory Surgical Center"
    | "Aquarium"
    | "Bank Branch"
    | "Bar/Nightclub"
    | "Barracks"
    | "Bowling Alley"
    | "Casino"
    | "CEGEP"
    | "College/University"
    | "Community Center and Social Meeting Hall"
    | "Convenience Store with Gas Station"
    | "Convenience Store without Gas Station"
    | "Convention Center"
    | "Courthouse"
    | "Data Center"
    | "Distribution Center"
    | "Drinking Water Treatment & Distribution"
    | "Electric Vehicle Charging Station"
    | "Enclosed Mall"
    | "Energy/Power Station"
    | "Fast Food Restaurant"
    | "Financial Office"
    | "Fire Station"
    | "Fitness Center/Health Club/Gym"
    | "Food Sales"
    | "Food Service"
    | "Hospital (General Medical & Surgical)"
    | "Hotel"
    | "Ice/Curling Rink"
    | "Indoor Arena"
    | "K-12 School"
    | "Laboratory"
    | "Library"
    | "Lifestyle Center"
    | "Mailing Center/Post Office"
    | "Manufacturing/Industrial Plant"
    | "Medical Office"
    | "Mixed Use Property"
    | "Movie Theater"
    | "Multifamily Housing"
    | "Museum"
    | "Non-Refrigerated Warehouse"
    | "Office"
    | "Other - Education"
    | "Other - Entertainment/Public Assembly"
    | "Other - Lodging/Residential"
    | "Other - Mall"
    | "Other - Public Services"
    | "Other - Recreation"
    | "Other - Restaurant/Bar"
    | "Other - Services"
    | "Other - Stadium"
    | "Other - Technology/Science"
    | "Other - Utility"
    | "Other"
    | "Other/Specialty Hospital"
    | "Outpatient Rehabilitation/Physical Therapy"
    | "Parking"
    | "Performing Arts"
    | "Personal Services (Health/Beauty, Dry Cleaning, etc)"
    | "Police Station"
    | "Pre-school/Daycare"
    | "Prison/Incarceration"
    | "Race Track"
    | "Refrigerated Warehouse"
    | "Vehicle Repair Services"
    | "Residence Hall/Dormitory"
    | "Residential Care Facility"
    | "Restaurant"
    | "Retail Store"
    | "Roller Rink"
    | "Self-Storage Facility"
    | "Senior Living Community"
    | "Single Family Home"
    | "Stadium (Closed)"
    | "Stadium (Open)"
    | "Strip Mall"
    | "Supermarket/Grocery Store"
    | "Swimming Pool"
    | "Transportation Terminal/Station"
    | "Urgent Care/Clinic/Other Outpatient"
    | "Vehicle Dealership"
    | "Veterinary Office"
    | "Vocational School"
    | "Wastewater Treatment Plant"
    | "Wholesale Club/Supercenter"
    | "Worship Facility"
    | "Zoo";
  /** The Gross Floor Area */
  grossFloorArea?: GrossFloorAreaType;
  /** The Irrigated Area */
  irrigatedArea?: IrrigationAreaType;
  /** The year the property was built. */
  yearBuilt?: number;
  address?: AddressType;
  /** The estimated number of buildings for this property. */
  numberOfBuildings?: number;
  /** Whether the property is federally owned. */
  isFederalProperty: boolean;
  /** The property physical address - country. */
  federalOwner?:
    | "US"
    | "AD"
    | "AE"
    | "AF"
    | "AG"
    | "AI"
    | "AL"
    | "AM"
    | "AO"
    | "AQ"
    | "AR"
    | "AT"
    | "AU"
    | "AW"
    | "AX"
    | "AZ"
    | "BA"
    | "BB"
    | "BD"
    | "BE"
    | "BF"
    | "BG"
    | "BH"
    | "BI"
    | "BJ"
    | "BL"
    | "BM"
    | "BN"
    | "BO"
    | "BQ"
    | "BR"
    | "BS"
    | "BT"
    | "BV"
    | "BW"
    | "BY"
    | "BZ"
    | "CA"
    | "CC"
    | "CD"
    | "CF"
    | "CG"
    | "CH"
    | "CI"
    | "CK"
    | "CL"
    | "CM"
    | "CN"
    | "CO"
    | "CR"
    | "CU"
    | "CV"
    | "CW"
    | "CX"
    | "CY"
    | "CZ"
    | "DE"
    | "DJ"
    | "DK"
    | "DM"
    | "DO"
    | "DZ"
    | "EC"
    | "EE"
    | "EG"
    | "EH"
    | "ER"
    | "ES"
    | "ET"
    | "FI"
    | "FJ"
    | "FK"
    | "FM"
    | "FO"
    | "FR"
    | "GA"
    | "GB"
    | "GD"
    | "GE"
    | "GF"
    | "GG"
    | "GH"
    | "GI"
    | "GL"
    | "GM"
    | "GN"
    | "GP"
    | "GQ"
    | "GR"
    | "GS"
    | "GT"
    | "GW"
    | "GY"
    | "HK"
    | "HM"
    | "HN"
    | "HR"
    | "HT"
    | "HU"
    | "ID"
    | "IE"
    | "IL"
    | "IM"
    | "IN"
    | "IO"
    | "IQ"
    | "IR"
    | "IS"
    | "IT"
    | "JE"
    | "JM"
    | "JO"
    | "JP"
    | "KE"
    | "KG"
    | "KH"
    | "KI"
    | "KM"
    | "KN"
    | "KP"
    | "KR"
    | "KW"
    | "KY"
    | "KZ"
    | "LA"
    | "LB"
    | "LC"
    | "LI"
    | "LK"
    | "LR"
    | "LS"
    | "LT"
    | "LU"
    | "LV"
    | "LY"
    | "MA"
    | "MC"
    | "MD"
    | "ME"
    | "MF"
    | "MG"
    | "MK"
    | "ML"
    | "MM"
    | "MN"
    | "MO"
    | "MQ"
    | "MR"
    | "MS"
    | "MT"
    | "MU"
    | "MV"
    | "MW"
    | "MX"
    | "MY"
    | "MZ"
    | "NA"
    | "NC"
    | "NE"
    | "NF"
    | "NG"
    | "NI"
    | "NL"
    | "NO"
    | "NP"
    | "NR"
    | "NU"
    | "NZ"
    | "OM"
    | "PA"
    | "PE"
    | "PF"
    | "PG"
    | "PH"
    | "PK"
    | "PL"
    | "PM"
    | "PN"
    | "PS"
    | "PT"
    | "PW"
    | "PY"
    | "QA"
    | "RE"
    | "RO"
    | "RS"
    | "RU"
    | "RW"
    | "SA"
    | "SB"
    | "SC"
    | "SD"
    | "SE"
    | "SG"
    | "SH"
    | "SI"
    | "SJ"
    | "SK"
    | "SL"
    | "SM"
    | "SN"
    | "SO"
    | "SR"
    | "SS"
    | "ST"
    | "SV"
    | "SX"
    | "SY"
    | "SZ"
    | "TC"
    | "TD"
    | "TF"
    | "TG"
    | "TH"
    | "TJ"
    | "TK"
    | "TL"
    | "TM"
    | "TN"
    | "TO"
    | "TR"
    | "TT"
    | "TV"
    | "TW"
    | "TZ"
    | "UA"
    | "UG"
    | "UY"
    | "UZ"
    | "VA"
    | "VC"
    | "VE"
    | "VG"
    | "VN"
    | "VU"
    | "WF"
    | "WS"
    | "YE"
    | "YT"
    | "ZA"
    | "ZM"
    | "ZW";
  /** The federal agency that owns or operates the building. */
  agency?: AgencyType;
  /** Optional additional information about the federal department or region. */
  agencyDepartmentRegion?: string;
  /** Name of the Federal Campus */
  federalCampus?: string;
  /** The percentage occupancy of the property. */
  occupancyPercentage: number;
  /** Notes about this property. */
  notes?: string;
  /** Whether the property is institutional property. */
  isInstitutionalProperty?: boolean;
  /** Current share level for the user calling the webservice. */
  accessLevel?: "Read" | "Read Write";
  audit?: LogType;
}

export interface RefrigeratedWarehouseType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    percentUsedForColdStorage?: UseIntegerType;
    clearHeight?: ClearHeightUnitsType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface Report {
  /** The unique identifier of the report. */
  id?: number;
  /** The type of report. */
  type?: "CUSTOM" | "ENERGY_STAR";
  /** The timeframe the report will be run against. */
  timeframe: TimeframeType;
  /** The id of the template. */
  templateId?: number;
  /** The name of the template. */
  templateName?: string;
  /** The list of properties that the report will be run for. */
  properties?: { id?: number[] };
  /** The current generation status of the report. */
  reportGenerationStatus?:
    | "INITIALIZED"
    | "SUBMITTED"
    | "IN_PROCESS"
    | "FAILED"
    | "GENERATED"
    | "READY_FOR_DOWNLOAD"
    | "GENERATED_WITH_ERRORS"
    | "SENT";
}

export interface ReportMetricValuesWs {
  /** The month of the period ending date for the set of metrics. */
  "@_month"?: string;
  /** The year of the period ending date for the set of metrics. */
  "@_year"?: string;
  /** The predefined period type used to generate the report metric */
  "@_periodType"?: string;
  /** Indicates whether the metric is automatically generated by the system. */
  "@_autoGenerated"?: string;
  /** The value of the Monthly metric. */
  value?: string[];
}

export interface ReportMetrics {
  /** A group of metrics. This corresponds to the groups that the metrics are organized into in the user interface. */
  group: {
    "@_id"?: string;
    "@_name"?: string;
    metrics: {
      metric?: {
        "@_id"?: string;
        "@_name"?: string;
        "@_description"?: string;
        "@_dataType"?: string;
        "@_uom"?: string;
        "@_availableToCustomMetrics"?: string;
      }[];
    };
  }[];
}

export interface ReportStatusDef {
  /** The status of the report. */
  status:
    | "INITIALIZED"
    | "SUBMITTED"
    | "IN_PROCESS"
    | "FAILED"
    | "GENERATED"
    | "READY_FOR_DOWNLOAD"
    | "GENERATED_WITH_ERRORS"
    | "SENT";
  /** This field is not currently being used. */
  description?: string;
  /** The date and timestamp of when the report generation started (in EST). */
  generationStartDate?: string;
  /** The date and timestamp of when the report generation completed (in EST). */
  generationEndDate?: string;
  /** The date and timestamp of when the report was submitted to be generated (in EST). */
  submittedDate?: string;
}

export interface ReportTemplateType {
  /** The unique identifier of the template. */
  id?: number;
  /** The name of the template. */
  name: string;
  /** The type of the template. This is ignore in a POST/PUT. */
  templateType?: "CUSTOM" | "ENERGY_STAR";
  /** The list of metrics configured to the template. */
  metrics?: { id?: number[] };
  /** The unique identifier to the corresponding report. */
  reportId?: number;
  audit?: LogType;
}

export interface ResidenceHallDormitoryType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfRooms?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    hasComputerLab?: UseYesNoType;
    hasDiningHall?: UseYesNoType;
  };
  audit?: LogType;
}

export interface ResidentPopulationType extends UseAttributeBase {
  value?:
    | "No specific resident population"
    | "Dedicated Student"
    | "Dedicated Military"
    | "Dedicated Senior/Independent Living"
    | "Dedicated Special Accessibility Needs"
    | "Other dedicated housing";
}

export interface ResidentialCareFacilityType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfResidentialLivingUnits?: UseDecimalType;
    averageNumberOfResidents?: UseDecimalType;
    maximumResidentCapacity?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfCommercialRefrigerationUnits?: UseDecimalType;
    numberOfCommercialWashingMachines?: UseDecimalType;
    numberOfResidentialWashingMachines?: UseDecimalType;
    numberOfResidentialLiftSystems?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    licensedBedCapacity?: UseDecimalType;
  };
  audit?: LogType;
}

/** A response of the operation. */
export interface ResponseType {
  /** The status of the web service call. Either Ok or Error. */
  "@_status": string;
  /** The id of the entity that you are trying to add or update. */
  id?: number;
  links?: LinksType;
  errors?: ErrorsType;
  warnings?: WarningsType;
}

export interface RestaurantType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingLocatedOnsite?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    lengthOfAllCommercialKitchenHoods?: LengthOfUseDetailType;
  };
  audit?: LogType;
}

export interface RetailType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    singleStore?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    cookingFacilities?: UseYesNoType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
  };
  audit?: LogType;
}

export interface SearchResultType {
  /** The ID to the account. This is provided by Portfolio Manager only in a XML response. */
  accountId?: number;
}

export interface SelfStorageFacilityType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    percentUsedForColdStorage?: UseIntegerType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    clearHeight?: ClearHeightUnitsType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    numberOfComputers?: UseDecimalType;
  };
  audit?: LogType;
}

export interface SeniorLivingCommunityType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfResidentialLivingUnits?: UseDecimalType;
    averageNumberOfResidents?: UseDecimalType;
    maximumResidentCapacity?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfCommercialRefrigerationUnits?: UseDecimalType;
    numberOfCommercialWashingMachines?: UseDecimalType;
    numberOfResidentialWashingMachines?: UseDecimalType;
    numberOfResidentialLiftSystems?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    licensedBedCapacity?: UseDecimalType;
  };
  audit?: LogType;
}

export interface SharingResponseType {
  /** The action you want to take in response to the share request (either Accept or Reject). */
  action: "Accept" | "Reject";
  /** The optional note that you can include with your accept/reject response. */
  note?: string;
}

export interface SingleFamilyHomeType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfBedrooms?: UseDecimalType;
    numberOfPeople?: UseIntegerType;
  };
  audit?: LogType;
}

export interface StadiumClosedType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    enclosedFloorArea?: OptionalFloorAreaType;
    numberOfSportingEventsPerYear?: UseIntegerType;
    numberOfConcertShowEventsPerYear?: UseIntegerType;
    numberOfSpecialOtherEventsPerYear?: UseIntegerType;
    sizeOfElectronicScoreBoards?: OptionalFloorAreaType;
    iceEvents?: UseYesNoType;
    numberOfComputers?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface StadiumOpenType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    enclosedFloorArea?: OptionalFloorAreaType;
    numberOfSportingEventsPerYear?: UseIntegerType;
    numberOfConcertShowEventsPerYear?: UseIntegerType;
    numberOfSpecialOtherEventsPerYear?: UseIntegerType;
    sizeOfElectronicScoreBoards?: OptionalFloorAreaType;
    iceEvents?: UseYesNoType;
    numberOfComputers?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
  };
  audit?: LogType;
}

export interface SupermarketType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    cookingFacilities?: UseYesNoType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    percentCooled?: PercentCooledType;
    percentHeated?: PercentHeatedType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    singleStore?: UseYesNoType;
    exteriorEntranceToThePublic?: UseYesNoType;
  };
  audit?: LogType;
}

export interface SwimmingPoolType {
  name: string;
  useDetails: {
    poolSize: PoolSizeType;
    poolLocation?: PoolType;
    monthsInUse?: MonthsInUseType;
  };
  audit?: LogType;
}

export interface TargetTypePercentageType {
  value: number;
}

export interface TargetTypeScoreType {
  value: number;
}

export interface TenantCommonAreaEnergyUseInformationType {
  /** Indicates the various energy uses if a "Combination of Tenant and Common Area Consumption" meter configuration type is selected. This is only required when a metering configuration type of "Combination of Tenant and Common Area Consumption" is specified. At least one of the 8 options must be selected. */
  energyUse: (
    | "Tenant Heating"
    | "Tenant Cooling"
    | "Tenant Hot Water"
    | "Tenant Plug Load/Electricity"
    | "Common Area Heating"
    | "Common Area Cooling"
    | "Common Area Hot Water"
    | "Common Area Plug Load/Electricity"
  )[];
}

export interface TerminateShareResponseType {
  /** The optional note that you can include with your termination request. */
  note?: string;
}

export interface TimeframeType {
  /** Returns metrics for the most recent year in which each of your properties has a full year of data for the selected meter type (energy/water/waste). This can be a different year for each property. */
  currentPeriod?: { meterType: "ENERGY" | "WATER" | "WASTE" };
  /** Returns metrics for the baseline period that you set on the "Goals" tab for each individual property. You can have different baselines for different meter types (energy/water/waste). */
  baselinePeriod?: { meterType: "ENERGY" | "WATER" | "WASTE" };
  /** Returns metrics for each property's current year and its baseline year. */
  currentVsBaseline?: { meterType: "ENERGY" | "WATER" | "WASTE" };
  /** Returns metrics for a specific year that you specify. */
  singlePeriod?: { periodEndingDate: Ped };
  /** Returns metrics for each property's current year and another year which you specify. */
  compareCurrentPeriod?: {
    meterType: "ENERGY" | "WATER" | "WASTE";
    periodEndingDate: Ped;
  };
  /** Returns metrics for each property's baseline period and another year which you specify. */
  compareBaselinePeriod?: {
    meterType: "ENERGY" | "WATER" | "WASTE";
    periodEndingDate: Ped;
  };
  /** Returns metrics for each property in two specific years that you select. */
  twoPeriods?: { periodEndingDateOne: Ped; periodEndingDateTwo: Ped };
  /** Returns metrics for each property on a monthly, quarterly, or annual interval between a start and end date that you specify. */
  dateRange?: {
    fromPeriodEndingDate: Ped;
    toPeriodEndingDate: Ped;
    interval: "MONTHLY" | "QUARTERLY" | "YEARLY";
  };
}

export interface TypeOfWasteMeter {
  /** The id of the waste meter. */
  id?: number;
  /** The name of the waste meter. */
  name: string;
  /** The type of waste meter. */
  type:
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
  /** The units that measure the waste quantity for the meter. */
  unitOfMeasure:
    | "pounds"
    | "Kilogram"
    | "tons"
    | "Tonnes (metric)"
    | "Cubic yards"
    | "cm (Cubic meters)"
    | "Gallons (US)"
    | "Gallons (UK)"
    | "Liters";
  /** The format of meter data entries. */
  dataEntryMethod: "regular" | "regular container" | "intermittent";
  /** The size of the container. */
  containerSize?: number;
  /** The date of the first bill. */
  firstBillDate?: string;
  /** Is this meter in use? */
  inUse: boolean;
  /** If the meter is no longer in use, this is the date that it went inactive. */
  inactiveDate?: string;
  /** Current share level for the user calling the webservice. */
  accessLevel?: "Read" | "Read Write";
  audit?: LogType;
}

export interface UnAuthDesignType {
  propertyInfo: PropertyDesignType;
  /** Most property use characteristics XML attributes (id, currentAsOf, and temporary) are not applicable and will be ignored if provided. */
  propertyUses: {
    prison?: OtherType[];
    refrigeratedWarehouse?: RefrigeratedWarehouseType[];
    retail?: RetailType[];
    hospital?: HospitalType[];
    medicalOffice?: MedicalOfficeType[];
    dataCenter?: DataCenterType[];
    courthouse?: CourthouseType[];
    singleFamilyHome?: SingleFamilyHomeType[];
    nonRefrigeratedWarehouse?: NonRefrigeratedWarehouseType[];
    multifamilyHousing?: MultifamilyHousingType[];
    office?: OfficeType[];
    wholesaleClubSupercenter?: WholesaleClubSupercenterType[];
    selfStorageFacility?: SelfStorageFacilityType[];
    seniorLivingCommunity?: SeniorLivingCommunityType[];
    residentialCareFacility?: ResidentialCareFacilityType[];
    swimmingPool?: SwimmingPoolType[];
    residenceHallDormitory?: ResidenceHallDormitoryType[];
    wastewaterTreatmentPlant?: WastewaterTreatmentPlantType[];
    distributionCenter?: DistributionCenterType[];
    worshipFacility?: WorshipFacilityType[];
    financialOffice?: FinancialOfficeType[];
    drinkingWaterTreatmentAndDistribution?: DrinkingWaterTreatmentAndDistributionType[];
    parking?: ParkingType[];
    supermarket?: SupermarketType[];
    barracks?: BarracksType[];
    hotel?: HotelType[];
    k12School?: K12SchoolType[];
    bankBranch?: BankBranchType[];
    cegep?: CegepType[];
    collegeUniversity?: CollegeUniversityType[];
    indoorArena?: IndoorArenaType[];
    otherStadium?: OtherStadiumType[];
    stadiumClosed?: StadiumClosedType[];
    stadiumOpen?: StadiumOpenType[];
    manufacturingIndustrialPlant?: ManufacturingIndustrialPlantType[];
    ambulatorySurgicalCenter?: OtherType[];
    bowlingAlley?: BowlingAlley[];
    otherPublicServices?: OtherType[];
    otherLodgingResidential?: OtherType[];
    casino?: OtherType[];
    personalServices?: OtherType[];
    mailingCenterPostOffice?: MailingCenterPostOfficeType[];
    library?: LibraryType[];
    otherSpecialityHospital?: OtherType[];
    conventionCenter?: OtherType[];
    veterinaryOffice?: OtherType[];
    urgentCareClinicOtherOutpatient?: OtherType[];
    energyPowerStation?: OtherType[];
    otherServices?: OtherType[];
    barNightclub?: OtherType[];
    otherUtility?: OtherType[];
    zoo?: OtherType[];
    vehicleDealership?: VehicleDealershipType[];
    museum?: MuseumType[];
    otherRecreation?: OtherType[];
    otherRestaurantBar?: OtherType[];
    lifestyleCenter?: OtherType[];
    policeStation?: OtherType[];
    preschoolDaycare?: PreschoolDaycareType[];
    raceTrack?: OtherType[];
    fastFoodRestaurant?: FastFoodRestaurantType[];
    laboratory?: OtherType[];
    convenienceStoreWithoutGasStation?: ConvenienceStoreWithoutGasStationType[];
    vehicleRepairServices?: VehicleRepairServicesType[];
    otherTechnologyScience?: OtherType[];
    fireStation?: FireStationType[];
    foodSales?: FoodSalesType[];
    performingArts?: OtherType[];
    outpatientRehabilitationPhysicalTherapy?: OtherType[];
    stripMall?: OtherType[];
    rollerRink?: OtherType[];
    otherEducation?: OtherType[];
    fitnessCenterHealthClubGym?: FitnessCenterHealthClubGym[];
    aquarium?: OtherType[];
    foodService?: OtherType[];
    restaurant?: RestaurantType[];
    enclosedMall?: OtherType[];
    iceCurlingRink?: IceCurlingRinkType[];
    adultEducation?: OtherType[];
    otherEntertainmentPublicAssembly?: OtherType[];
    movieTheater?: OtherType[];
    transportationTerminalStation?: OtherType[];
    vocationalSchool?: OtherType[];
    communityCenterAndSocialMeetingHall?: CommunityCenterAndSocialMeetingHall[];
    otherMall?: OtherType[];
    convenienceStoreWithGasStation?: ConvenienceStoreWithGasStationType[];
    other?: OtherType[];
    electricVehicleChargingStation?: EvChargingStationType[];
  };
  /** The planned average daily flow for a Water Treatment and Distribution Plant. This value must be specified if one of the property uses is of the type Water Distribution. */
  drinkingWaterInfluentFlow?: number;
  /** The planned average daily flow of water through a Wastewater Treatment Plant. This value must be specified if one of the property uses is of the type Waste Water Treatment Plant. */
  wasteWaterInfluentFlow?: number;
  /** The amount of energy required by the server racks, storage silos, and other IT equipment in the Data Center at the output of UPS. This value must be specified if one of the property uses is of the type Data Center */
  itSiteEnergy?: number;
  /** If you can estimate how much energy your design property will use annually, provide it here to receive a score (if available) and energy metrics for your design. You can then use these metrics to compare to your target and/or property's operation (in the future). To get the most accurate metrics, provide estimates for total annual energy from each potential energy source. */
  estimatedEnergyList?: { entries: EstimatedEnergyListType };
  /** The Design Target can be either ENERGY STAR Score or "% Better than Median." */
  target: {
    targetTypeScore?: TargetTypeScoreType;
    targetTypePercentage?: TargetTypePercentageType;
  };
  /** The WMO id of the international weather station. */
  internationalWeatherStationId?: string;
}

export interface UpsSystemRedundancyType extends UseAttributeBase {
  value?: "N" | "N+1" | "N+2" | "2N" | "Greater than 2N" | "None of the Above";
}

export interface UseAttributeBase {
  "@_id"?: string;
  /** The date that the characteristic is current as of. */
  "@_currentAsOf"?: string;
  /** The characteristic is a temporary value (true/false) */
  "@_temporary"?: string;
  /** Indicates whether the value for this characteristic was calculated by the system using default values (Yes, No, or N/A). If the characteristic is required for benchmarking and the value is being defaulted then it is set to Yes otherwise No. If the characteristic is not required for benchmarking then it is set to N/A. This attribute only applies to retrieving data. It will be ignored if provided as input. Also note that even though gross floor area is required for benchmarking, it is set to No since the system never provides a value for that characteristic. */
  "@_default"?: string;
  audit?: LogType;
}

export interface UseDecimalType extends UseAttributeBase {
  value?: number;
}

export interface UseIntegerType extends UseAttributeBase {
  value?: number;
}

export interface UseStringType extends UseAttributeBase {
  value?: string;
}

export interface UseYesNoType extends UseAttributeBase {
  value?: "Yes" | "No";
}

export interface VehicleDealershipType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfWorkers?: UseDecimalType;
    averageNumberOfVehiclesInInventory?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfPaintBays?: UseDecimalType;
    numberOfRepairBays?: UseDecimalType;
  };
  audit?: LogType;
}

export interface VehicleRepairServicesType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    numberOfWorkers?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfPaintBays?: UseDecimalType;
    numberOfRepairBays?: UseDecimalType;
  };
  audit?: LogType;
}

export interface WarningType {
  /** The number of the warning. */
  "@_warningNumber"?: string;
  /** The description of the warning. */
  "@_warningDescription"?: string;
}

/** A list of warnings. */
export interface WarningsType {
  /** The warning of the web service call. */
  warning?: WarningType[];
}

export interface WasteMeterAssocAndConfigType {
  meters: MeterListType;
}

/** A service type used for getting and sending waste meter entry data. */
export interface WasteMeterDataType {
  /** Waste data used for a waste meter that is set up to be metered. */
  wasteData?: WasteMeterEntryType[];
  links?: LinksType;
}

/** A service type used for representing a single waste meter entry datum. */
export interface WasteMeterEntryType {
  /** Whether the meter entry is an estimated value. */
  "@_estimatedValue"?: string;
  /** The id of the meter entry. */
  id?: number;
  /** The first date of the meter entry reading. */
  startDate: string;
  /** The last date of the meter entry reading. */
  endDate?: string;
  /** The quantity of the meter entry. */
  quantity?: number;
  /** The number of times that the waste meter container was emptied for the meter entry. */
  timesEmptied?: number;
  /** The average percentage full of the waste meter container for the meter entry. */
  averagePercentFull?: number;
  /** The cost of meter entry. */
  cost?: "" | number;
  disposalDestination?: DisposalDestinationType;
  audit?: LogType;
}

export interface WastewaterTreatmentPlantType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    averageInfluentBiologicalOxygenDemand?: UseDecimalType;
    averageEffluentBiologicalOxygenDemand?: UseDecimalType;
    plantDesignFlowRate: PlantDesignFlowRateType;
    fixedFilmTrickleFiltrationProcess?: UseYesNoType;
    nutrientRemoval?: UseYesNoType;
  };
  audit?: LogType;
}

export interface WaterMeterAssocAndConfigType {
  meters: MeterListType;
  /** Indication of what energy is covered by the energy meters you associate together for calculations */
  propertyRepresentation: {
    propertyRepresentationType:
      | "Whole Property"
      | "Common Area Energy Consumption Only"
      | "Tenant Energy Consumption Only"
      | "Combination of Tenant and Common Area Consumption"
      | "Other"
      | "No Selection Made";
    tenantCommonAreaEnergyUseList?: TenantCommonAreaEnergyUseInformationType;
    propertyRepresentationTypeOtherDesc?: string;
  };
}

export interface WholesaleClubSupercenterType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    exteriorEntranceToThePublic?: UseYesNoType;
    weeklyOperatingHours?: UseDecimalType;
    numberOfWorkers?: UseDecimalType;
    numberOfCashRegisters?: UseDecimalType;
    numberOfComputers?: UseDecimalType;
    numberOfOpenClosedRefrigerationUnits?: UseDecimalType;
    numberOfWalkInRefrigerationUnits?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
    singleStore?: UseYesNoType;
    areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType;
    lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType;
    cookingFacilities?: UseYesNoType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
  };
  audit?: LogType;
}

export interface WorshipFacilityType {
  name: string;
  useDetails: {
    totalGrossFloorArea: GrossFloorAreaType;
    weeklyOperatingHours?: UseDecimalType;
    seatingCapacity?: UseDecimalType;
    ceilingHeight?: CeilingHeightUnitsType;
    cookingFacilities?: UseYesNoType;
    grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType;
    numberOfWeekdaysOpen?: NumberOfWeekdaysType;
    numberOfComputers?: UseDecimalType;
    numberOfCommercialRefrigerationUnits?: UseDecimalType;
    percentHeated?: PercentHeatedType;
    percentCooled?: PercentCooledType;
  };
  audit?: LogType;
}

export interface AccountInfoElement {
  firstName: string;
  lastName: string;
  email: string;
  address: AddressType;
  jobTitle: string;
  phone: string;
  organization?: string;
}

/** The values associated to the additional property/meter identifier for a given property. This is used when you provide the values (update or add) to an additional property identifier for a specific property. */
export interface AdditionalIdentifierElement {
  /** The id of the transaction when values are provided for a specific additional property identifier and property. */
  "@_id"?: string;
  /** The additional property identifier that EPA has approved for use. This is used when you just want to get the complete static list of additional property identifiers. This set includes the unique identifier #1, #2, and #3 and the set that EPA is maintaining/approved. */
  additionalIdentifierType: {
    "@_id"?: string;
    "@_standardApproved"?: string;
    "@_name"?: string;
    "@_description"?: string;
    "@_group"?: string;
  };
  /** The description of the specific additional property identifier when values are provided for it. */
  description?: string;
  /** The value of the additional property identifier for a specific property. */
  value?: string;
}

/** The additional property identifier that EPA has approved for use. This is used when you just want to get the complete static list of additional property identifiers. This set includes the unique identifier #1, #2, and #3 and the set that EPA is maintaining/approved. */
export interface AdditionalIdentifierTypeElement {
  /** The id of the additional property identifier */
  "@_id"?: string;
  /** Whether the additional property identifier is from the standard list that EPA is maintaining (versus the generic set of 3 unique identifier fields that can be used) */
  "@_standardApproved"?: string;
  /** The name of the additional property identifier */
  "@_name"?: string;
  /** The description of the additional property identifier. */
  "@_description"?: string;
  /** The group of the additional property identifier. */
  "@_group"?: string;
}

export interface AdditionalIdentifierTypesElement {
  /** The additional property identifier that EPA has approved for use. This is used when you just want to get the complete static list of additional property identifiers. This set includes the unique identifier #1, #2, and #3 and the set that EPA is maintaining/approved. */
  additionalIdentifierType?: {
    "@_id"?: string;
    "@_standardApproved"?: string;
    "@_name"?: string;
    "@_description"?: string;
    "@_group"?: string;
  }[];
}

export interface AdditionalIdentifiersElement {
  /** The values associated to the additional property/meter identifier for a given property. This is used when you provide the values (update or add) to an additional property identifier for a specific property. */
  additionalIdentifier?: {
    "@_id"?: string;
    additionalIdentifierType: {
      "@_id"?: string;
      "@_standardApproved"?: string;
      "@_name"?: string;
      "@_description"?: string;
      "@_group"?: string;
    };
    description?: string;
    value?: string;
  }[];
}

/** Settings to your billboard metric */
export interface BillboardMetricSettingElement {
  billboardMetric: string;
}

/** Additional field (outside of Portfolio Manager) that you can prompt a user to provide data through the connection/share process. */
export interface CustomFieldElement {
  /** The custom field name which will display to the PM user. */
  "@_name": string;
  /** Whether the field is required or not. */
  "@_required": string;
  /** The set of valid characters allowed for input. */
  "@_validCharacters": string;
  /** When the custom field should be prompted to the user (i.e., every account, every property, or every meter). */
  "@_whenToPrompt": string;
  /** The minimum number of characters allowed for input. */
  minChars?: number;
  /** The maximum number of characters allowed for input. */
  maxChars?: number;
  /** The description of the custom field that is displayed. */
  description?: string;
  /** Example of input. */
  example?: string;
  /** The URL of a web page with more information about this field. */
  url?: string;
  /** The display order if multiple custom fields have been created. */
  displayOrder?: number;
}

export interface CustomFieldListElement {
  customField?: { "#text"?: string; "@_name"?: string }[];
}

export interface CustomMetricElement {
  /** The unique identifier of the custom metric. */
  "@_id"?: string;
  "@_unitOfMeasure"?: string;
  name?: string;
  numeratorMetricId: number;
  denominatorDetailTypeId: number;
}

/** Contains information for a Portfolio Manager account. */
export interface CustomerElement {
  /** The username for your customer's account. */
  username?: string;
  /** This indicates if the Test Property in the account is included in the graphs on My Portfolio page. If true then test property is included and if false then Test property is excluded. */
  includeTestPropertiesInGraphics?: boolean;
  /** Contact me with training opportunities, tool updates, program news and other information about the ENERGY STAR program. */
  emailPreferenceCanadianAccount?: boolean;
  /** Your saved billboard metric */
  billboardMetric?: string;
  languagePreference?: "en_US" | "fr_CA" | "es_US";
  accountInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    address: AddressType;
    jobTitle: string;
    phone: string;
    organization?: string;
  };
}

export interface DataExchangeSettingsElement {
  /** The list of meter types that you support. */
  supportedMeterTypes?: {
    meterType?: (
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
      | "Well Water - Outdoor"
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
      | "Recycled - Textiles/Clothing"
    )[];
  };
  termsOfUse?: { none?: ""; text?: string; url?: string };
}

export interface DetailTypeElement {
  "@_id"?: string;
  "@_name"?: string;
}

export interface DetailsTypesElement {
  detailType: { "@_id"?: string; "@_name"?: string }[];
}

/** Electric Distribution Utility Information */
export interface EGridSubregionElement {
  /** The code of the eGrid Subregion. */
  "@_code"?: string;
  /** The name of the eGrid Subregion. */
  "@_name"?: string;
  /** The country in which the eGrid Subregion is located. */
  "@_country"?: string;
}

export interface EGridSubregionListElement {
  /** Electric Distribution Utility Information */
  eGridSubregion?: {
    "@_code"?: string;
    "@_name"?: string;
    "@_country"?: string;
  }[];
}

/** Electric Distribution Utility Information */
export interface EduElement {
  /** The code to the Electric Distribution Utility (EDU) */
  "@_eduCode"?: string;
  /** The name of Electric Distribution Utility (EDU). */
  "@_name"?: string;
  /** This is the default EDU for a property if there are multiple EDU options. */
  "@_preferred"?: string;
  /** Whether the property is currently assigned to this EDU. */
  "@_selected"?: string;
  /** The code of the eGrid Subregion that the EDU belongs to. */
  "@_eGridCode"?: string;
  /** The name of the eGrid Subregion that the EDU belongs to. */
  "@_eGridName"?: string;
}

export interface EduListElement {
  /** Electric Distribution Utility Information */
  edu?: {
    "@_eduCode"?: string;
    "@_name"?: string;
    "@_preferred"?: string;
    "@_selected"?: string;
    "@_eGridCode"?: string;
    "@_eGridName"?: string;
  }[];
}

export interface FederalAgenciesElement {
  agency?: AgencyType[];
}

export interface IndividualMeterElement {
  /** The id of the individual meter. */
  id?: number;
  /** The id of the aggregated/parent meter. */
  meterId?: number;
  /** Custom Id of the individual meter */
  customId?: string;
  /** Custom Id Name of the individual meter */
  customIdName?: string;
  /** Service address of the individual meter */
  serviceAddress?: string;
  /** Is this individual meter in use? */
  inUse?: boolean;
  /** If the individual meter is no longer in use, this is the date that it went inactive. */
  inactiveDate?: string;
  audit?: LogType;
}

export interface InternationalWeatherStationListElement {
  /** International Weather Station information */
  station?: {
    "@_id"?: string;
    "@_country"?: string;
    "@_countryName"?: string;
    "@_stationName"?: string;
  }[];
  links?: LinksType;
}

export interface LicenseElement {
  /** Index number of the stored license details */
  index?: string;
  /** License country code */
  countryCode?: "US" | "CA" | "";
  /** License Number for all professional designations. */
  licenseNumber?: string;
  /** License State Code */
  licenseState?:
    | "AK"
    | "AL"
    | "AR"
    | "AS"
    | "AZ"
    | "CA"
    | "CO"
    | "CT"
    | "DC"
    | "DE"
    | "FL"
    | "GA"
    | "GU"
    | "HI"
    | "IA"
    | "ID"
    | "IL"
    | "IN"
    | "KS"
    | "KY"
    | "LA"
    | "MA"
    | "MD"
    | "ME"
    | "MH"
    | "MI"
    | "MN"
    | "MO"
    | "MP"
    | "MS"
    | "MT"
    | "NC"
    | "ND"
    | "NE"
    | "NH"
    | "NJ"
    | "NM"
    | "NN"
    | "NV"
    | "NY"
    | "OH"
    | "OK"
    | "OR"
    | "PA"
    | "PI"
    | "PR"
    | "RI"
    | "SC"
    | "SD"
    | "TN"
    | "TT"
    | "TX"
    | "UM"
    | "UT"
    | "VA"
    | "VI"
    | "VT"
    | "WA"
    | "WI"
    | "WQ"
    | "WV"
    | "WY"
    | "AB"
    | "BC"
    | "MB"
    | "NB"
    | "NL"
    | "NS"
    | "NT"
    | "NU"
    | "ON"
    | "PE"
    | "QC"
    | "SK"
    | "YT";
  /** License Name for Other */
  licenseName?: string;
}

export interface LicenseListElement {
  license?: {
    index?: string;
    countryCode?: "US" | "CA" | "";
    licenseNumber?: string;
    licenseState?:
      | "AK"
      | "AL"
      | "AR"
      | "AS"
      | "AZ"
      | "CA"
      | "CO"
      | "CT"
      | "DC"
      | "DE"
      | "FL"
      | "GA"
      | "GU"
      | "HI"
      | "IA"
      | "ID"
      | "IL"
      | "IN"
      | "KS"
      | "KY"
      | "LA"
      | "MA"
      | "MD"
      | "ME"
      | "MH"
      | "MI"
      | "MN"
      | "MO"
      | "MP"
      | "MS"
      | "MT"
      | "NC"
      | "ND"
      | "NE"
      | "NH"
      | "NJ"
      | "NM"
      | "NN"
      | "NV"
      | "NY"
      | "OH"
      | "OK"
      | "OR"
      | "PA"
      | "PI"
      | "PR"
      | "RI"
      | "SC"
      | "SD"
      | "TN"
      | "TT"
      | "TX"
      | "UM"
      | "UT"
      | "VA"
      | "VI"
      | "VT"
      | "WA"
      | "WI"
      | "WQ"
      | "WV"
      | "WY"
      | "AB"
      | "BC"
      | "MB"
      | "NB"
      | "NL"
      | "NS"
      | "NT"
      | "NU"
      | "ON"
      | "PE"
      | "QC"
      | "SK"
      | "YT";
    licenseName?: string;
  }[];
}

export interface OnsiteRenewableDetailsElement {
  onsiteRenewableDetail?: OnsiteRenewableDetailType[];
  links?: LinksType;
}

/** Power Generation Plant information */
export interface PgpElement {
  /** The ORIS plant code. */
  "@_plantCode"?: string;
  /** The name of PGP (power generation plant). */
  "@_name"?: string;
  /** Whether the property is currently assigned to this PGP. */
  "@_selected"?: string;
  /** The code of the eGrid Subregion that the PGP belongs to. */
  "@_eGridCode"?: string;
  /** The name of the eGrid Subregion that the PGP belongs to. */
  "@_eGridName"?: string;
}

export interface PgpListElement {
  /** Power Generation Plant information */
  pgp?: {
    "@_plantCode"?: string;
    "@_name"?: string;
    "@_selected"?: string;
    "@_eGridCode"?: string;
    "@_eGridName"?: string;
  }[];
}

export interface ProfessionalDesignationListElement {
  professionalDesignation: {
    "@_id": string;
    "@_name"?: string;
    licenseList?: {
      license?: {
        index?: string;
        countryCode?: "US" | "CA" | "";
        licenseNumber?: string;
        licenseState?:
          | "AK"
          | "AL"
          | "AR"
          | "AS"
          | "AZ"
          | "CA"
          | "CO"
          | "CT"
          | "DC"
          | "DE"
          | "FL"
          | "GA"
          | "GU"
          | "HI"
          | "IA"
          | "ID"
          | "IL"
          | "IN"
          | "KS"
          | "KY"
          | "LA"
          | "MA"
          | "MD"
          | "ME"
          | "MH"
          | "MI"
          | "MN"
          | "MO"
          | "MP"
          | "MS"
          | "MT"
          | "NC"
          | "ND"
          | "NE"
          | "NH"
          | "NJ"
          | "NM"
          | "NN"
          | "NV"
          | "NY"
          | "OH"
          | "OK"
          | "OR"
          | "PA"
          | "PI"
          | "PR"
          | "RI"
          | "SC"
          | "SD"
          | "TN"
          | "TT"
          | "TX"
          | "UM"
          | "UT"
          | "VA"
          | "VI"
          | "VT"
          | "WA"
          | "WI"
          | "WQ"
          | "WV"
          | "WY"
          | "AB"
          | "BC"
          | "MB"
          | "NB"
          | "NL"
          | "NS"
          | "NT"
          | "NU"
          | "ON"
          | "PE"
          | "QC"
          | "SK"
          | "YT";
        licenseName?: string;
      }[];
    };
  }[];
}

/** Indication of what energy is covered by the energy meters you associate together for calculations */
export interface PropertyRepresentationElement {
  /** Indication of what energy is covered by the energy meters you associate together for calculations */
  propertyRepresentationType:
    | "Whole Property"
    | "Common Area Energy Consumption Only"
    | "Tenant Energy Consumption Only"
    | "Combination of Tenant and Common Area Consumption"
    | "Other"
    | "No Selection Made";
  /** Indicates the various energy uses if a "Combination of Tenant and Common Area Consumption" property representation type is selected. This is only required when "Combination of Tenant and Common Area Consumption" is specified. At least one of the 8 options must be selected. */
  tenantCommonAreaEnergyUseList?: TenantCommonAreaEnergyUseInformationType;
  /** If you chose "Other" for the property representation, this is the description. */
  propertyRepresentationTypeOtherDesc?: string;
}

/** This is used to update property use name only. */
export interface PropertyUseElement {
  name: string;
}

export interface ReportErrorElement {
  /** The id of the report. */
  reportId: number;
  /** The name of the template. */
  templateName: string;
  /** The timestamp when the report was generated */
  dateGenerated: string;
  /** The total count of the properties in the report */
  numberOfProperties: number;
  missingMetrics: {
    propertyMissingMetric?: {
      "@_propertyId"?: string;
      "@_propertyName"?: string;
      yearEndingDate?: string;
      metric?: { "@_name"?: string; "@_id"?: string; error: string }[];
    }[];
  };
}

export interface ResponseStatusElement extends ReportStatusDef {
  /** The date and timestamp of when the data response was sent to the requester. */
  sentDate?: string;
  errors?: { links?: LinksType };
}

export interface SendDataResponseElement {
  /** The additional email addresses to send confirmation email to. */
  additionalEmailAddresses?: { email?: string[] };
  /** The email attachment format to send data in, EXCEL or XML. */
  fileFormat: "EXCEL" | "XML";
  /** Allow to send data when generated response contains errors. */
  submitWithErrors: boolean;
}

/** International Weather Station information */
export interface StationElement {
  /** The station WMO id. */
  "@_id"?: string;
  /** The country code (ISO 3166) of the station. */
  "@_country"?: string;
  /** The country name of the station. */
  "@_countryName"?: string;
  /** The name of the station. */
  "@_stationName"?: string;
}

export interface UseDetailsElement {
  links?: LinksType;
  /** Quantity of laundry processed at the property. */
  amountOfLaundryProcessedAnnually?: AmountOfLaundryProcessedAnnuallyType[];
  /** The concentration of effluent Biological Oxygen Demand (BOD5) at a wastewater treatment plant. */
  averageEffluentBiologicalOxygenDemand?: UseDecimalType[];
  /** The concentration of influent Biological Oxygen Demand (BOD5) at a wastewater treatment plant. */
  averageInfluentBiologicalOxygenDemand?: UseDecimalType[];
  /** Annual average number of residents at the property. */
  averageNumberOfResidents?: UseDecimalType[];
  /** Area of parking garage that is completely enclosed. */
  completelyEnclosedFootage?: GrossFloorAreaType[];
  /** Whether there are Cooking Facilities. */
  cookingFacilities?: UseYesNoType[];
  /** Level of redundancy for the cooling equipment in a Data Center. */
  coolingEquipmentRedundancy?: CoolingEquipmentRedundancyType[];
  /** Total enclosed floor area at a Stadium/Arena. */
  enclosedFloorArea?: OptionalFloorAreaType[];
  enrollment?: UseDecimalType[];
  /** Whether there is an Exterior Entrance to the Public. */
  exteriorEntranceToThePublic?: UseYesNoType[];
  /** Whether there is a Fixed Film Trickle Filtration Process. */
  fixedFilmTrickleFiltrationProcess?: UseYesNoType[];
  /** Floor area associated with a Full Service Spa. */
  fullServiceSpaFloorArea?: OptionalFloorAreaType[];
  /** Area of all walk-in refrigeration/freezer units - include only commercial type units that a person actually walks into to retrieve goods. See numberOfWalkInRefrigerationUnits for more information. */
  areaOfAllWalkInRefrigerationUnits?: OptionalFloorAreaType[];
  /** Length of all open or closed Refrigeration or Freezer cases that are used for the sale or storage of perishable goods. Include display-type refrigerated open or closed cases and cabinets, as well as display-type freezer units. These are typically found on the sales floor. See numberOfOpenClosedRefrigerationUnits for more information. */
  lengthOfAllOpenClosedRefrigerationUnits?: LengthOfUseDetailType[];
  /** Whether this is housing that is subsidized by the local, state, or Federal government. */
  governmentSubsidizedHousing?: UseYesNoType[];
  grantDollars?: UseDecimalType[];
  /** Floor area associated with a Gym/Fitness Center. */
  gymCenterFloorArea?: OptionalFloorAreaType[];
  /** Floor area associated with a gymnasium at a K12 School. */
  gymnasiumFloorArea?: OptionalFloorAreaType[];
  /** Whether there is a Computer Lab. */
  hasComputerLab?: UseYesNoType[];
  /** Whether there is a Dining Hall. */
  hasDiningHall?: UseYesNoType[];
  /** Presence of a laboratory (Yes/No). */
  hasLaboratory?: UseYesNoType[];
  /** Number of hours per day a typical guest spends at the property (Less Than 15, 15 To 19, More Than 20) */
  hoursPerDayGuestsOnsite?: HoursPerDayGuestsOnsiteType[];
  /** Are there ice-related events such as Hockey, Skating, Ice Capades? */
  iceEvents?: UseYesNoType[];
  /** Presence of a High School, as indicated by education of grades 10, 11, and/or 12 (Yes/No). */
  isHighSchool?: UseYesNoType[];
  /** Presence of tertiary medical care, specialized care beyond a typical secondary level, such as Level 1 trauma centers, organ transplant, or prenatal intensive care units (Yes/No). */
  isTertiaryCare?: UseYesNoType[];
  /** The IT Energy Configuration/location of IT Energy meters at a data center. */
  itEnergyMeterConfiguration?: ItEnergyConfigurationType[];
  /** Type of laundry processed at the property (linens, Terry, Linens & Terry) */
  laundryFacility?: OnsiteLaundryType[];
  /** Maximum number of floors in the tallest building at the property. */
  maximumNumberOfFloors?: UseIntegerType[];
  /** Maximum capacity of residents, based on the design of the facility. */
  maximumResidentCapacity?: UseDecimalType[];
  /** Licensed Bed Capacity is the total number of beds that your hospital is licensed to have in operation. This may be more than your Staffed Beds, which are those that are set up and ready for use. */
  licensedBedCapacity?: UseDecimalType[];
  /** Number of months per year the property is in use. */
  monthsInUse?: MonthsInUseType[];
  /** Number of months per year the property is in use. */
  monthsMainIndoorIceRinkInUse?: MonthsInUseType[];
  /** Number of bedrooms. */
  numberOfBedrooms?: UseDecimalType[];
  /** Number of cash registers. */
  numberOfCashRegisters?: UseDecimalType[];
  /** Number of Commercial Refrigeration/Freezer cases, including any open or closed commercial type case, and including any walk-in units. */
  numberOfCommercialRefrigerationUnits?: UseDecimalType[];
  /** Number of commercial-type washing machines. (This does not include residential or coin-operated machines) */
  numberOfCommercialWashingMachines?: UseDecimalType[];
  /** Number of computers and servers at the property. */
  numberOfComputers?: UseDecimalType[];
  /** Number of concert/show events per year. */
  numberOfConcertShowEventsPerYear?: UseIntegerType[];
  /** Number of units located in individual buildings that are 1 to 4 stories in height, as well as units located wings/portions of larger buildings that fall in this height range (e.g. if Wing A is 6 stories and Wing B is 3 stories, only units in Wing B would be counted here). */
  numberOfResidentialLivingUnitsLowRiseSetting?: UseDecimalType[];
  /** Number of full-time equivalent workers (total number of hours worked by all workers, divided by the standard hours in a full time shift). */
  numberOfFTEWorkers?: UseDecimalType[];
  /** Total number of guest meals (also called meal covers) served each year. */
  numberOfGuestMealsServedPerYear?: UseIntegerType[];
  /** The total number of laundry hookups in all individual living units (counting hookups, whether or not there is a machine). */
  numberOfLaundryHookupsInAllUnits?: UseIntegerType[];
  /** The total number of laundry hookups in all common areas (counting hookups, whether or not there is a machine). */
  numberOfLaundryHookupsInCommonArea?: UseIntegerType[];
  /** Number of MRI Machines. */
  numberOfMriMachines?: UseDecimalType[];
  /** The Number of Open or Closed Refrigeration/Freezer Units is the count of open or closed cases that are used for the sale or storage of perishable goods. This includes display-type refrigerated open or closed cases and cabinets as well as display-type freezer units typically found on a sales floor. Each case or cabinet section, typically 4 to 12 feet in length, should be considered 1 unit. Include those cases located inside and immediately adjacent to the building. These units may be portable or permanent, and may have doors, plastic strips, or other flexible cover. This count should not include vending machines. If your property is in the design phase, use your best estimate for the intended conditions when the property is fully operational. */
  numberOfOpenClosedRefrigerationUnits?: UseDecimalType[];
  /** Number of people living in the home. */
  numberOfPeople?: UseIntegerType[];
  /** Number of residential electronic lift systems. */
  numberOfResidentialLiftSystems?: UseDecimalType[];
  /** Total number of residential living units (apartments or condominiums) at the property. This value must equal the sum of the number of residential living units in a low-rise setting, mid-rise setting, and high-rise setting. A 0.9 tolerance is allowed. */
  numberOfResidentialLivingUnits?: UseDecimalType[];
  /** Number of residential-type washing machines. */
  numberOfResidentialWashingMachines?: UseDecimalType[];
  /** Total number of rooms for a lodging type of property (hotel, dormitory, etc). */
  numberOfRooms?: UseDecimalType[];
  /** Total number of rooms for a lodging type of property (hotel). */
  numberOfHotelRooms?: UseDecimalType[];
  /** Number of special/other events per year at a stadium/arena (i.e. events that are neither concerts/shows nor athletic events). */
  numberOfSpecialOtherEventsPerYear?: UseIntegerType[];
  /** Number of sporting/athletic events per year. */
  numberOfSportingEventsPerYear?: UseIntegerType[];
  /** Number of beds set up and staffed for use at a hospital. */
  numberOfStaffedBeds?: UseDecimalType[];
  /** Number of beds associated with surgical operation at a medial office/outpatient healthcare facility. */
  numberOfSurgicalOperatingBeds?: UseDecimalType[];
  /** Number of walk-in refrigeration/freezer units - including only those commercial type units that you can completely enter to retrieve goods. */
  numberOfWalkInRefrigerationUnits?: UseDecimalType[];
  /** Number of weekdays (Monday through Friday) the property is open. This will be an number between 0 and 5. */
  numberOfWeekdaysOpen?: NumberOfWeekdaysType[];
  /** The total number of workers during the primary (largest shift) - this is only a total number of people in the building at a single time. */
  numberOfWorkers?: UseDecimalType[];
  /** Number of indoor ice rinks used for indoor hockey, ringette, public or figure skating. This does not include curling sheets. */
  numberOfIndoorIceRinks?: UseIntegerType[];
  /** Total number of floods in a week using ice resurfacing machines after typical ice rink use for all indoor hockey, ringette, public or figure skating ice rinks in the facility. This does not include curling sheet resurfacing or pebbling. For multiple rinks, sum the total number of weekly resurfacing for all rinks. */
  numberOfWeeklyIceResurfacingForAllRinks?: NumberOfWeeklyIceResurfacingType[];
  /** Number of ice sheets specifically for the purpose of the game of curling. */
  numberOfCurlingSheets?: UseIntegerType[];
  /** Presence of a nutrient removal system at a wastewater treatment plant (Yes/No). */
  nutrientRemoval?: UseYesNoType[];
  /** Presence of an on-site Laundry Facility (Yes/No). */
  onSiteLaundryFacility?: UseYesNoType[];
  /** Total area of open parking lots/areas. */
  openFootage?: GrossFloorAreaType[];
  /** Indication of regular activities that occur on either Saturday or Sunday (Yes/No). */
  openOnWeekends?: UseYesNoType[];
  /** Indication of whether the property is owned by a private, not-for profit, or government organization. */
  ownedBy?: OwnedByType[];
  /** Total area of all parking structures that are only partially enclosed (i.e. multi-level structures that only have partial walls). */
  partiallyEnclosedFootage?: GrossFloorAreaType[];
  /** The percent of the property that can be cooled by mechanical cooling equipment. */
  percentCooled?: PercentCooledType[];
  /** The percent of the property that can be heated by mechanical heating equipment. */
  percentHeated?: PercentHeatedType[];
  /** Number of units located in individual buildings that are 5 to 9 stories in height, as well as units located wings/portions of larger buildings that fall in this height range (e.g. if Wing A is 6 stories and Wing B is 3 stories, only units in Wing A would be counted here). */
  numberOfResidentialLivingUnitsMidRiseSetting?: UseDecimalType[];
  /** The percent of the Gross Floor Area that is common space (not individual tenant areas) */
  percentOfGrossFloorAreaThatIsCommonSpaceOnly?: UseDecimalType[];
  percentOfficeCooled?: PercentOfficeCooledType[];
  percentOfficeHeated?: PercentOfficeHeatedType[];
  /** The indoor ice rink surface area is the total area covered by ice of all the ice rinks used for indoor hockey, ringette, public or figure skating and can be estimated by multiplying the length of the ice surface with the width of the ice surface and adding together the calculated area for each ice rink in the facility. This surface area does not include curling sheets. */
  totalIceRinkSurfaceAreaForAllRinks?: OptionalFloorAreaType[];
  /** The designed flow rate of a wastewater treatment plant (e.g. the capacity of the plant) in million gallons per day (MGD). */
  plantDesignFlowRate?: PlantDesignFlowRateType[];
  /** Indication of whether a pool is indoor or outdoor. */
  poolLocation?: PoolType[];
  /** Approximate size of a swimming pool (Short Course, Recreational, Olympic). */
  poolSize?: PoolSizeType[];
  /** Number of units located in individual buildings that are 10 or more stories in height, as well as units located in wings/portions of buildings that fall in this range (e.g. if Wing A is 10 stories and Wing B is 5 stories, only units in Wing A would be counted here). */
  numberOfResidentialLivingUnitsHighRiseSetting?: UseDecimalType[];
  /** An indication of the type of residents living at the property, if applicable (e.g. student, military, senior, etc). */
  residentPopulation?: ResidentPopulationType[];
  /** The school district in which the school is located. */
  schoolDistrict?: UseStringType[];
  /** The seating capacity associated with the main areas of worship in a worship facility. */
  seatingCapacity?: UseDecimalType[];
  /** Indication that a Retail Store is a single store (Yes/No). */
  singleStore?: UseYesNoType[];
  totalGrossFloorArea?: GrossFloorAreaType[];
  /** Whether Data Center IT energy estimates are applied. */
  estimatesApplied?: UseYesNoType[];
  /** Level of redundancy for the Uninterruptible Power Supply (UPS) system in a Data Center. */
  upsSystemRedundancy?: UpsSystemRedundancyType[];
  /** The total size of electronic score boards at a stadium/arena. */
  sizeOfElectronicScoreBoards?: OptionalFloorAreaType[];
  /** Number of ice sheets specifically for the purpose of the game of curling. */
  spectatorSeatingCapacity?: UseDecimalType[];
  /** Presence of supplemental heating systems in a parking garage (Yes/No). */
  supplementalHeating?: UseYesNoType[];
  /** The number of students the school can accommodate (including portable classrooms). */
  studentSeatingCapacity?: UseDecimalType[];
  /** The area within a medical office or outpatient healthcare property devoted to surgery. */
  surgeryCenterFloorArea?: OptionalFloorAreaType[];
  /** The total number of hours per week that the property is occupied by the majority of the employees. It does not include hours when the property is occupied only by maintenance, security, or other support personnel. */
  weeklyOperatingHours?: UseDecimalType[];
  /** The total percentage of your property that is enclosed insulated storage space intended for the cooling or freezing of goods, merchandise, raw materials, or manufactured products in buildings (or portions of buildings), at or less than 50 degrees F. */
  percentUsedForColdStorage?: UseIntegerType[];
  /** The Gross Floor Area Used for Food Preparation is the total size of all large/commercial kitchen areas used for the storage and preparation of food. This will be a subset of Gross Floor Area for the property. */
  grossFloorAreaUsedForFoodPreparation?: OptionalFloorAreaType[];
  /** The Gross Floor Area that is Hotel Conference Space is the total size of all conference spaces. This will be a subset of Gross Floor Area for the property. */
  grossFloorAreaHotelConferenceSpace?: OptionalFloorAreaType[];
  /** The distance measured from the floor to the lowest overhead obstruction for the majority of the warehouse space. */
  clearHeight?: ClearHeightUnitsType[];
  /** Number of working autoclaves and sterilizers in the building. */
  numberOfSterilizationUnits?: UseDecimalType[];
  /** Indicates presence of common entrance: Yes and No are 2 options and 1 or 0 is used. */
  commonEntrance?: UseYesNoType[];
  /** Number of cooking equipment units in a convenience store. */
  numberOfCookingEquipmentUnits?: UseIntegerType[];
  /** Number of warming/heating equipment units in a convenience store. */
  numberOfWarmingHeatingEquipmentUnits?: UseIntegerType[];
  /** The maximum vertical distance measured from floor to ceiling. */
  ceilingHeight?: CeilingHeightUnitsType[];
  /** The average number of vehicles in inventory, not including vehicles housed at off-site locations. */
  averageNumberOfVehiclesInInventory?: UseDecimalType[];
  /** Denotes if a facility delivers mail products directly from the building to offsite customers at their residence or place of business. */
  deliveryFacility?: UseYesNoType[];
  /** The number of letters and packages per year is the typical sum of mail products (such as lettermail, flyers, packages, parcels etc.) processed for outbound delivery in this facility in a 12 month period. */
  numberOfLettersPackagesPerYear?: UseIntegerType[];
  /** Custom Use Detail #1 */
  customUseDetail1?: CustomUseDetailsType[];
  /** Custom Use Detail #2 */
  customUseDetail2?: CustomUseDetailsType[];
  /** Indicates presence of precise humidity and temperature control: Yes and No are 2 options and 1 or 0 is used. */
  precisionControlsForTemperatureAndHumidity?: UseYesNoType[];
  /** The Gross Floor Area refers to the total area used for public collection display areas. It is a subset of the total Gross Floor Area. It should not include outdoor public collection display areas. */
  grossFloorAreaThatIsExhibitSpace?: OptionalFloorAreaType[];
  /** The number of paint bays is the number of spaces in a contained booth for painting or painting preparatory work. */
  numberOfPaintBays?: UseDecimalType[];
  /** The number of repair bays is the count of designated spaces for a single vehicle to receive maintenance or repair. */
  numberOfRepairBays?: UseDecimalType[];
  /** This is the length of all commercial kitchen exhaust hoods in metres. Kitchen Exhaust hood is defined in ASHRAE Handbook - HVAC Applications Chapter: Kitchen Ventilation. Commercial kitchen exhaust hoods are used primarily to remove cooking effluent from kitchens. */
  lengthOfAllCommercialKitchenHoods?: LengthOfUseDetailType[];
  /** Denotes if hot or cold food is prepared by cooking and assembling raw ingredients at the property location. */
  cookingLocatedOnsite?: UseYesNoType[];
  /** Buildings used for manufacturing or assembling goods. Includes the plant type and sub type classification (if any). */
  plantType?: PlantDataType[];
  /** The number of emergency vehicles is the count of vehicles that are housed at and deployed from a station. */
  numberOfEmergencyVehicles?: UseDecimalType[];
  /** The number of annual emergency incidents is the typical count of instances a station deploys equipment, personnel, or vehicles for its facility in a 12-month period. */
  numberOfAnnualEmergencyIncidents?: UseDecimalType[];
  /** The number of hours per week that at least one worker or volunteer is in the building. */
  weeklyBuildingOccupiedHours?: UseDecimalType[];
  /** Number of Level One electric vehicle charging stations. */
  numberOfLevelOneEvChargingStations?: UseDecimalType[];
  /** Number of Level Two electric vehicle charging stations. */
  numberOfLevelTwoEvChargingStations?: UseDecimalType[];
  /** Number of DC Fast electric vehicle charging stations. */
  numberOfDcFastEvChargingStations?: UseDecimalType[];
  /** Number of students enrolled at the campus in the indicated semester that are considered full time status by the school. */
  numberOfFullTimeStudentsEnrolledMayToAugust?: UseDecimalType[];
  /** Number of students enrolled at the campus in the indicated semester that are considered full time status by the school. */
  numberOfFullTimeStudentsEnrolledJanuaryToApril?: UseDecimalType[];
  /** Number of students enrolled at the campus in the indicated semester that are considered full time status by the school. */
  numberOfFullTimeStudentsEnrolledSeptemberToDecember?: UseDecimalType[];
  /** The amount of money this campus spends on research and development in a typical year. */
  annualResearchExpenditure?: AnnualResearchExpenditureType[];
  /** The percentage of the floor area of this campus that is specialized instruction or research space that caters to specific uses. */
  percentOfLabFloorArea?: UseIntegerType[];
  /** The Highest Level of Award for higher education institutions is based on the highest level of degree, diploma, or certificate offered by the institution. */
  highestAwardLevel?: HighestAwardLevelType[];
}

export interface VerificationElement {
  /** Period Ending Date. */
  periodEndingDate: string;
  /** Date of verification by the verifier. */
  verificationDate: string;
  /** Verifier name */
  name: string;
  /** Verifier title */
  title: string;
  /** Verifier organization */
  organization: string;
  /** Verifier phone */
  phone: string;
  /** Verifier email */
  email: string;
  /** Verifier postal code */
  postalCode: string;
  professionalDesignationList?: {
    professionalDesignation: {
      "@_id": string;
      "@_name"?: string;
      licenseList?: {
        license?: {
          index?: string;
          countryCode?: "US" | "CA" | "";
          licenseNumber?: string;
          licenseState?:
            | "AK"
            | "AL"
            | "AR"
            | "AS"
            | "AZ"
            | "CA"
            | "CO"
            | "CT"
            | "DC"
            | "DE"
            | "FL"
            | "GA"
            | "GU"
            | "HI"
            | "IA"
            | "ID"
            | "IL"
            | "IN"
            | "KS"
            | "KY"
            | "LA"
            | "MA"
            | "MD"
            | "ME"
            | "MH"
            | "MI"
            | "MN"
            | "MO"
            | "MP"
            | "MS"
            | "MT"
            | "NC"
            | "ND"
            | "NE"
            | "NH"
            | "NJ"
            | "NM"
            | "NN"
            | "NV"
            | "NY"
            | "OH"
            | "OK"
            | "OR"
            | "PA"
            | "PI"
            | "PR"
            | "RI"
            | "SC"
            | "SD"
            | "TN"
            | "TT"
            | "TX"
            | "UM"
            | "UT"
            | "VA"
            | "VI"
            | "VT"
            | "WA"
            | "WI"
            | "WQ"
            | "WV"
            | "WY"
            | "AB"
            | "BC"
            | "MB"
            | "NB"
            | "NL"
            | "NS"
            | "NT"
            | "NU"
            | "ON"
            | "PE"
            | "QC"
            | "SK"
            | "YT";
          licenseName?: string;
        }[];
      };
    }[];
  };
  audit?: LogType;
}
