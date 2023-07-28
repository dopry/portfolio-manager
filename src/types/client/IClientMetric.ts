export interface IClientMetric {
  propertyId: number;
  name: string;
  value?: string | number | null;
  uom?: string;
  year: number;
  month: number;
}
