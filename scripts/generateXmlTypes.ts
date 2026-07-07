/**
 * Generates fast-xml-parser configuration from the vendored ESPM XSDs.
 *
 * Phase 1 (see plans/xsd-driven-type-generation.md): walk every document
 * root declared in each vendored xml-schemas/portfoliomanager-schemas-*
 * directory and emit the set of jpaths whose elements can occur more than
 * once (maxOccurs > 1). fast-xml-parser collapses single-occurrence
 * elements to plain objects, so the runtime needs this list to guarantee
 * array shapes; it was previously hand-maintained and drifted from the
 * schemas.
 *
 * Usage: npm run generate:xml
 *
 * The ESPM schemas declare no target namespaces and reference each other
 * only via xs:include, so all named types, groups, and elements live in one
 * flat symbol table built from every *.xsd file.
 */
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { XMLParser } from "fast-xml-parser";

// EPA deploys new schema versions to the test environment before
// production, so more than one portfoliomanager-schemas-* directory may be
// vendored at a time; every one of them is processed and the runtime list
// is the union (an element marked as an array in either version parses as
// an array-of-one under the other, which keeps consumer shapes stable
// across the rollout).
const SCHEMA_ROOT = "xml-schemas";
const SCHEMA_DIR_PREFIX = "portfoliomanager-schemas-";
const OUTPUT_FILE = "src/types/xml/generated/isArrayJPaths.ts";
// Recursion guard: the schemas are shallow; anything deeper is a cycle that
// slipped past the named-type guard.
const MAX_DEPTH = 20;

// XSD structural tags that must always parse as arrays for the walker.
const XSD_LIST_TAGS = new Set([
  "element",
  "complexType",
  "simpleType",
  "group",
  "attributeGroup",
  "sequence",
  "all",
  "choice",
  "include",
  "enumeration",
]);

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  // Keep attribute values (maxOccurs="unbounded" | "5") as strings.
  parseAttributeValue: false,
  isArray: (name) => XSD_LIST_TAGS.has(name),
});

type XsdNode = any;

function findXsdFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findXsdFiles(path));
    else if (entry.name.endsWith(".xsd")) files.push(path);
  }
  return files.sort();
}

// Flat symbol tables: the schemas declare no namespaces, so names are global
// within a version. Rebuilt per schema directory.
let complexTypes = new Map<string, XsdNode>();
let groups = new Map<string, XsdNode>();
let topLevelElements = new Map<string, XsdNode>();
let arrayJPaths = new Set<string>();

function indexSchema(schema: XsdNode): void {
  for (const node of schema.complexType ?? []) {
    if (node["@_name"]) complexTypes.set(node["@_name"], node);
  }
  for (const node of schema.group ?? []) {
    if (node["@_name"]) groups.set(node["@_name"], node);
  }
  for (const node of schema.element ?? []) {
    if (node["@_name"]) topLevelElements.set(node["@_name"], node);
  }
}

function isMany(node: XsdNode): boolean {
  const max = node?.["@_maxOccurs"];
  if (max === undefined) return false;
  return max === "unbounded" || Number.parseInt(max, 10) > 1;
}

/**
 * Walks a compositor (sequence | all | choice) or group body, visiting each
 * element occurrence. `forcedMany` is set when an enclosing compositor or
 * group reference itself repeats, which makes every element inside it
 * repeatable in the document regardless of its own maxOccurs.
 */
function walkCompositor(
  node: XsdNode,
  path: string,
  typeStack: readonly string[],
  forcedMany: boolean,
): void {
  if (!node) return;
  for (const kind of ["sequence", "all", "choice"]) {
    for (const compositor of node[kind] ?? []) {
      const compositorMany = forcedMany || isMany(compositor);
      for (const element of compositor.element ?? []) {
        walkElement(element, path, typeStack, compositorMany);
      }
      for (const groupRef of compositor.group ?? []) {
        const name = groupRef["@_ref"];
        const group = name ? groups.get(name) : undefined;
        if (group) {
          walkCompositor(
            group,
            path,
            typeStack,
            compositorMany || isMany(groupRef),
          );
        }
      }
      // Nested compositors (e.g. a choice inside a sequence).
      walkCompositor(compositor, path, typeStack, compositorMany);
    }
  }
}

/** Walks the children of a complexType, following extensions to their base. */
function walkComplexType(
  type: XsdNode,
  path: string,
  typeStack: readonly string[],
): void {
  walkCompositor(type, path, typeStack, false);
  for (const content of [type.complexContent, type.simpleContent]) {
    const extension = content?.extension;
    if (!extension) continue;
    const base = extension["@_base"]
      ? complexTypes.get(extension["@_base"])
      : undefined;
    if (base && !typeStack.includes(extension["@_base"])) {
      walkComplexType(base, path, [...typeStack, extension["@_base"]]);
    }
    walkCompositor(extension, path, typeStack, false);
  }
}

function walkElement(
  element: XsdNode,
  parentPath: string,
  typeStack: readonly string[],
  forcedMany: boolean,
): void {
  // ref= elements reuse a top-level declaration for name and content.
  const target = element["@_ref"]
    ? topLevelElements.get(element["@_ref"])
    : element;
  const name = element["@_ref"] ?? target?.["@_name"];
  if (!target || !name) return;

  const path = parentPath === "" ? name : `${parentPath}.${name}`;
  if (forcedMany || isMany(element)) {
    arrayJPaths.add(path);
  }
  if (typeStack.length >= MAX_DEPTH) {
    throw new Error(`Max depth exceeded at ${path}`);
  }

  const typeName = target["@_type"];
  if (typeName && complexTypes.has(typeName)) {
    if (typeStack.includes(typeName)) return; // cycle
    walkComplexType(complexTypes.get(typeName), path, [...typeStack, typeName]);
    return;
  }
  for (const inline of target.complexType ?? []) {
    walkComplexType(inline, path, [...typeStack, `${path}#inline`]);
  }
}

function generateForSchemaDir(dir: string): Set<string> {
  complexTypes = new Map();
  groups = new Map();
  topLevelElements = new Map();
  arrayJPaths = new Set();

  const files = findXsdFiles(dir);
  for (const file of files) {
    const schema = parser.parse(readFileSync(file, "utf8")).schema;
    if (schema) indexSchema(schema);
  }
  for (const [name, element] of topLevelElements) {
    walkElement({ ...element, "@_name": name }, "", [], false);
  }
  console.log(
    `${relative(".", dir)}: ${files.length} schema files, ` +
      `${topLevelElements.size} document roots, ${arrayJPaths.size} array jpaths`,
  );
  return arrayJPaths;
}

const schemaDirs = readdirSync(SCHEMA_ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith(SCHEMA_DIR_PREFIX))
  .map((e) => e.name)
  .sort();
if (schemaDirs.length === 0) {
  throw new Error(`No ${SCHEMA_DIR_PREFIX}* directories under ${SCHEMA_ROOT}`);
}

const byVersion = new Map<string, Set<string>>();
for (const dirName of schemaDirs) {
  const version = dirName.slice(SCHEMA_DIR_PREFIX.length);
  byVersion.set(version, generateForSchemaDir(join(SCHEMA_ROOT, dirName)));
}
const union = new Set<string>([...byVersion.values()].flatMap((s) => [...s]));

const renderSet = (paths: Set<string>): string =>
  `new Set([\n${[...paths]
    .sort()
    .map((p) => `  "${p}",`)
    .join("\n")}\n])`;

const versionEntries = [...byVersion.entries()]
  .map(([version, paths]) => `  "${version}": ${renderSet(paths)},`)
  .join("\n");

const output = `// GENERATED FILE — do not edit by hand.
// Regenerate with \`npm run generate:xml\` after updating xml-schemas/.
// Every jpath whose element the XSDs declare with maxOccurs > 1, from each
// document root; fast-xml-parser needs the list to keep single-occurrence
// responses in array shape. EPA rolls schema versions through test before
// production, so each vendored version gets its own set and the runtime
// consumes the union.
export const XSD_ARRAY_JPATHS_BY_VERSION: Readonly<
  Record<string, ReadonlySet<string>>
> = {
${versionEntries}
};

export const XSD_ARRAY_JPATHS: ReadonlySet<string> = ${renderSet(union)};
`;

mkdirSync("src/types/xml/generated", { recursive: true });
writeFileSync(OUTPUT_FILE, output);
execSync(`npx prettier --write ${OUTPUT_FILE}`, { stdio: "inherit" });
console.log(
  `Versions: ${[...byVersion.keys()].join(", ")}; union ${union.size} jpaths -> ${OUTPUT_FILE}`,
);
