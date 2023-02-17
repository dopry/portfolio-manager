import { PeriodType } from "../enum";

export type DataType = "date" | "numeric" | "string";

export interface ReportMetricValue {
  value: string | number; // The value of the metric
  "@_year": string; // The year of the metric
  "@_month": string; // The month of the metric
  "@_periodType": PeriodType; // The period type of the metric
  "@_autoGenerated": boolean; // Indicates whether the metric is auto-generated by the system.
}

export interface IPropertyMetric {
  monthlyMetric?: ReportMetricValue[]; // the value of the monthly metric
  value?: { "@_xsi:nil": boolean } | string; // The value of the Non-Monthly metric
  "@_name": string; // The name of the metric
  "@_id"?: number; // The id of the metric
  "@_uom"?: string; // The unit of measure of the metric
  "@_dataType": DataType; // The data type of the value the metric (i.e., string, numeric, date).
  "@_autoGenerated"?: boolean; // Indicates whether the metric is auto-generated by the system.
}

export interface IPropertyMonthlyMetric extends IPropertyMetric {
  monthlyMetric: ReportMetricValue[];
  value: undefined;
}

export function isIPropertyMonthlyMetric(
  metric: IPropertyMetric
): metric is IPropertyMonthlyMetric {
  return (metric as IPropertyMonthlyMetric).monthlyMetric !== undefined;
}

export interface IPropertyNonMonthlyMetric extends IPropertyMetric {
  monthlyMetric: undefined;
  value: { "@_xsi:nil": boolean } | string;
}

export function isIPropertyNonMonthlyMetric(
  metric: IPropertyMetric
): metric is IPropertyNonMonthlyMetric {
  return (metric as IPropertyNonMonthlyMetric).value !== undefined;
}


export interface PropertyMetrics {
  "@_year"?: number;
  "@_month"?: number;
  "@_periodType"?: PeriodType;
  "@_propertyId": string;

  metric: IPropertyMetric[];
}