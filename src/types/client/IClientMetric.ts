export interface IClientMetric {
  propertyId: number;
  name: string;
  value?: string | number | null;
  uom?: string;
  year: number;
  month: number;
}


export interface IClientMetricMonthlyValue {
  value: string | number | null;
  year: number;
  month: number;
}

export interface IClientMetricMonthly {
  propertyId: number;
  name: string;
  value:  IClientMetricMonthlyValue[];
  uom: string;
  year: number;
  month: number;
}
