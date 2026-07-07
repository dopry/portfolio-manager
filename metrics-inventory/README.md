# Custom Reporting Metric Inventory

`custom-reporting-metric-inventory.csv` is the source of truth for
`src/types/api/METRICS.ts`, which is generated from it by
`npm run generate:metrics`.

## Provenance

- Source workbook: [Custom_Reporting_Metric_Inventory_en_US.xlsx](https://downloads.energystar.gov/bi/portfolio-manager/Custom_Reporting_Metric_Inventory_en_US.xlsx)
  (linked from the [web services home page](https://portfoliomanager.energystar.gov/webservices/home)
  as "Full List of Reporting Metrics").
- Vendored refresh: workbook stamped **2026-07-06**.

## Updating

1. Download the workbook and export its second sheet (the one whose header
   row starts with `Metric Group` and includes
   `Web Services Name (for Get Metric calls)`) as CSV, keeping the first
   nine columns (through `Web Service Call Method`) and dropping the
   preamble rows above the header.
2. Save it over `custom-reporting-metric-inventory.csv`.
3. `npm run generate:metrics` and review the METRICS.ts diff — added or
   removed metrics and availability changes are the behavioral surface.

The per-API availability flags in `MetricTuple` are derived from the
`Web Service Call Method` column (Get-* call names joined by `AND`), so the
whole tuple is workbook-driven; there is no hand-maintained metric data.
