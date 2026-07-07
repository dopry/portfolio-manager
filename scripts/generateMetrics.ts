/**
 * Generates src/types/api/METRICS.ts from EPA's Custom Reporting Metric
 * Inventory, vendored as metrics-inventory/custom-reporting-metric-inventory.csv
 * (see metrics-inventory/README.md for the source and refresh procedure).
 *
 * Every MetricTuple field derives from the workbook, including the per-API
 * availability flags: the "Web Service Call Method" column lists the Get-*
 * calls that serve each metric, joined by "AND".
 *
 * Usage: npm run generate:metrics
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const INPUT_FILE = "metrics-inventory/custom-reporting-metric-inventory.csv";
const OUTPUT_FILE = "src/types/api/METRICS.ts";

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, LF line ends. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Tuple flag order 7..15 plus the trailing PGP flag; token names are the
// exact values used in the workbook's Web Service Call Method column.
const API_FLAGS = [
  "Get-Metrics",
  "Get-Design-Metrics",
  "Get-Property",
  "Get-Property-EDU-List",
  "Get-Property-Unique-Identifier",
  "Get-Property-Meter-Association",
  "Get-Use-Details-Metrics",
  "Get-Monthly-Metrics",
  "Get-Reasons-For-No-Energy-Score",
  "Get-Property-PGP-List",
];

const rows = parseCsv(readFileSync(INPUT_FILE, "utf8"));
const header = rows[0];
const expectedHeader = [
  "Metric Group",
  "Metric Group ID",
  "User Interface Metric Name",
  "Unit of Measure (EPA)",
  "Unit of Measure (METRIC)",
  "Data Type",
  "Metric ID (for Custom Reporting calls)",
  "Web Services Name (for Get Metric calls)",
  "Web Service Call Method",
];
if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
  throw new Error(
    `Unexpected CSV header; the workbook layout changed:\n${header.join(" | ")}`,
  );
}

const seen = new Set<string>();
const tuples: string[] = [];
const unknownTokens = new Set<string>();
for (const row of rows.slice(1)) {
  const [
    group,
    groupId,
    uiName,
    uomEPA,
    uomMetric,
    dataType,
    id,
    slug,
    method,
  ] = row;
  if (!slug) continue;
  if (seen.has(slug)) {
    throw new Error(`Duplicate Web Services Name in inventory: ${slug}`);
  }
  seen.add(slug);

  const tokens = method
    .split(/\s+AND\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  for (const token of tokens) {
    if (!API_FLAGS.includes(token)) unknownTokens.add(token);
  }
  const flags = API_FLAGS.map((api) => tokens.includes(api));

  const cells = [
    ...[slug, id, dataType, uomEPA, uomMetric, group, groupId].map((value) =>
      JSON.stringify(value),
    ),
    ...flags.slice(0, 9).map(String),
    JSON.stringify(method),
    JSON.stringify(uiName),
    String(flags[9]),
  ];
  tuples.push(`[${cells.join(",")}],`);
}
if (unknownTokens.size > 0) {
  throw new Error(
    `Unknown Web Service Call Method tokens: ${[...unknownTokens].join(", ")}`,
  );
}

const output = `// GENERATED FILE — do not edit by hand.
// Regenerate with \`npm run generate:metrics\` after refreshing
// ${INPUT_FILE} (see metrics-inventory/README.md).
export type MetricTuple = [
  slug: string, // 0
  id: string, // 1
  dataType: string, // 2
  uomEPA: string, // 3
  uomMetric: string, // 4
  metricGroup: string, // 5
  metricGroupId: string, // 6
  // indicates which apis this metric is available in, derived from the
  // inventory's Web Service Call Method column
  getMetrics: boolean, // 7
  getDesignMetrics: boolean, // 8
  getProperty: boolean, // 9
  getPropertyEDUList: boolean, // 10
  getPropertyUniqueIdentifier: boolean, // 11
  getPropertyMeterAssociation: boolean, // 12
  getUseDetailsMetrics: boolean, // 13
  getMonthlyMetrics: boolean, // 14
  getReasonsForNoEnergyScore: boolean, // 15
  webServiceCallMethod: string, // 16
  userInterfaceMetricName: string, // 17
  getPropertyPGPList: boolean, // 18
];
// prettier-ignore
export const METRICS: MetricTuple[] = [
${tuples.join("\n")}
];
`;

writeFileSync(OUTPUT_FILE, output);
execSync(`npx prettier --write ${OUTPUT_FILE}`, { stdio: "inherit" });
console.log(`${tuples.length} metrics -> ${OUTPUT_FILE}`);
