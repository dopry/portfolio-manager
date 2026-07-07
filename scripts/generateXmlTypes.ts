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
  "attribute",
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
let simpleTypes = new Map<string, XsdNode>();
let groups = new Map<string, XsdNode>();
let topLevelElements = new Map<string, XsdNode>();
let arrayJPaths = new Set<string>();

function indexSchema(schema: XsdNode): void {
  for (const node of schema.complexType ?? []) {
    if (node["@_name"]) complexTypes.set(node["@_name"], node);
  }
  for (const node of schema.simpleType ?? []) {
    if (node["@_name"]) simpleTypes.set(node["@_name"], node);
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
  simpleTypes = new Map();
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

// ---------------------------------------------------------------------------
// Phase 2: TypeScript interface emission (one file per schema version).
// Conventions mirror the runtime fast-xml-parser configuration: attributes
// are "@_"-prefixed and always strings (parseAttributeValue is off), tag
// values parse numerics to number, booleans stay per xs:boolean, and
// maxOccurs > 1 elements are arrays (matching the generated jpath list).
// ---------------------------------------------------------------------------

const XSD_NUMERIC = new Set([
  "long",
  "int",
  "integer",
  "decimal",
  "double",
  "float",
  "short",
  "byte",
  "unsignedLong",
  "unsignedInt",
  "unsignedShort",
  "nonNegativeInteger",
  "positiveInteger",
]);

function mapPrimitive(xsdType: string): string {
  const local = xsdType.replace(/^xs:/, "");
  if (XSD_NUMERIC.has(local)) return "number";
  if (local === "boolean") return "boolean";
  return "string";
}

function pascal(name: string): string {
  const clean = name.replace(/[^A-Za-z0-9_$]/g, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function docComment(node: XsdNode, indent: string): string {
  const doc = node?.annotation?.documentation;
  const text = (typeof doc === "string" ? doc : doc?.["#text"])
    ?.toString()
    .replace(/\s+/g, " ")
    .trim();
  return text ? `${indent}/** ${text.replace(/\*\//g, "*\\/")} */\n` : "";
}

/** Resolves a simple type (named, inline, or xs:*) to a TS type string. */
function resolveSimpleType(ref: XsdNode | string, stack: string[]): string {
  if (typeof ref === "string") {
    if (ref.startsWith("xs:")) return mapPrimitive(ref);
    const named = simpleTypes.get(ref);
    if (!named || stack.includes(ref)) return "string";
    return resolveSimpleType(named, [...stack, ref]);
  }
  const restriction = ref.restriction;
  if (restriction) {
    const base = restriction["@_base"] as string | undefined;
    const baseTs = base ? resolveSimpleType(base, stack) : "string";
    const enums = (restriction.enumeration ?? [])
      .map((e: XsdNode) => e["@_value"])
      .filter((v: unknown) => v !== undefined);
    if (enums.length > 0 && baseTs === "string") {
      return enums.map((v: string) => JSON.stringify(String(v))).join(" | ");
    }
    return baseTs;
  }
  if (ref.union) {
    const members = ((ref.union["@_memberTypes"] as string) ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((m) => resolveSimpleType(m, stack));
    const inline = (ref.union.simpleType ?? []).map((t: XsdNode) =>
      resolveSimpleType(t, stack),
    );
    const all = [...new Set([...members, ...inline])];
    return all.length > 0 ? all.join(" | ") : "string";
  }
  return "string"; // xs:list and anything exotic degrade to string
}

interface EmittedProp {
  name: string;
  tsType: string;
  optional: boolean;
  many: boolean;
  doc: string;
}

/**
 * Renders a prop's value type, parenthesizing unions before appending `[]`
 * (`(A | B)[]`, not `A | B[]` which would only array-ify the last member).
 */
function renderValueType(prop: EmittedProp): string {
  if (!prop.many) return prop.tsType;
  return /[|&]/.test(prop.tsType) ? `(${prop.tsType})[]` : `${prop.tsType}[]`;
}

/** Resolves an element's value type; may recurse into inline complex types. */
function elementTsType(element: XsdNode, stack: string[]): string {
  const typeName = element["@_type"] as string | undefined;
  if (typeName) {
    if (complexTypes.has(typeName)) return pascal(typeName);
    if (simpleTypes.has(typeName) || typeName.startsWith("xs:")) {
      return resolveSimpleType(typeName, []);
    }
    return "string";
  }
  const inlineComplex = (element.complexType ?? [])[0];
  if (inlineComplex) {
    if (stack.length >= MAX_DEPTH) throw new Error("Inline type too deep");
    const body = complexTypeBody(inlineComplex, [...stack, "#inline"]);
    const props = body.props
      .map(
        (prop) =>
          `${JSON.stringify(prop.name) === `"${prop.name}"` && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(prop.name) ? prop.name : JSON.stringify(prop.name)}${prop.optional ? "?" : ""}: ${renderValueType(prop)}`,
      )
      .join("; ");
    return props.length > 0 ? `{ ${props} }` : "Record<string, unknown>";
  }
  const inlineSimple = (element.simpleType ?? [])[0];
  if (inlineSimple) return resolveSimpleType(inlineSimple, []);
  return "string";
}

/** Collects attribute and child-element props of a complexType body. */
function complexTypeBody(
  type: XsdNode,
  stack: string[],
): { extendsBase?: string; props: EmittedProp[] } {
  const props: EmittedProp[] = [];
  let extendsBase: string | undefined;

  const addAttributes = (owner: XsdNode) => {
    for (const attribute of owner?.attribute ?? []) {
      const name = attribute["@_name"];
      if (!name) continue;
      props.push({
        name: `@_${name}`,
        // The runtime parser keeps attribute values as strings.
        tsType: "string",
        optional: attribute["@_use"] !== "required",
        many: false,
        doc: docComment(attribute, "  "),
      });
    }
  };

  // forcedMany mirrors walkCompositor: a repeating enclosing compositor or
  // group reference makes every element inside it repeatable regardless of
  // the element's own maxOccurs.
  const addCompositors = (
    owner: XsdNode,
    optional: boolean,
    forcedMany: boolean,
  ) => {
    if (!owner) return;
    for (const kind of ["sequence", "all", "choice"]) {
      for (const compositor of owner[kind] ?? []) {
        const compositorOptional =
          optional || kind === "choice" || compositor["@_minOccurs"] === "0";
        const compositorMany = forcedMany || isMany(compositor);
        for (const element of compositor.element ?? []) {
          const target = element["@_ref"]
            ? topLevelElements.get(element["@_ref"])
            : element;
          const name = element["@_ref"] ?? target?.["@_name"];
          if (!target || !name) continue;
          props.push({
            name,
            tsType: elementTsType(target, stack),
            optional: compositorOptional || element["@_minOccurs"] === "0",
            many: compositorMany || isMany(element),
            doc: docComment(element, "  ") || docComment(target, "  "),
          });
        }
        for (const groupRef of compositor.group ?? []) {
          const group = groupRef["@_ref"]
            ? groups.get(groupRef["@_ref"])
            : undefined;
          if (group) {
            addCompositors(
              group,
              compositorOptional || groupRef["@_minOccurs"] === "0",
              compositorMany || isMany(groupRef),
            );
          }
        }
        addCompositors(compositor, compositorOptional, compositorMany);
      }
    }
  };

  addAttributes(type);
  addCompositors(type, false, false);

  for (const contentKind of ["complexContent", "simpleContent"]) {
    const extension = type[contentKind]?.extension;
    if (!extension) continue;
    const base = extension["@_base"] as string | undefined;
    if (base && complexTypes.has(base)) {
      extendsBase = pascal(base);
    } else if (base && contentKind === "simpleContent") {
      props.push({
        name: "#text",
        tsType: resolveSimpleType(base, []),
        optional: true,
        many: false,
        doc: "",
      });
    }
    addAttributes(extension);
    addCompositors(extension, false, false);
  }

  return { extendsBase, props };
}

function renderProps(props: EmittedProp[]): string {
  return props
    .map((prop) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(prop.name)
        ? prop.name
        : JSON.stringify(prop.name);
      return `${prop.doc}  ${key}${prop.optional ? "?" : ""}: ${renderValueType(prop)};`;
    })
    .join("\n");
}

function emitTypesForVersion(version: string): void {
  const parts: string[] = [
    "// GENERATED FILE — do not edit by hand.",
    "// Regenerate with `npm run generate:xml` after updating xml-schemas/.",
    `// TypeScript mirror of ESPM schema version ${version}, following the`,
    '// runtime fast-xml-parser conventions (attributes as "@_"-prefixed',
    "// strings, repeatable elements as arrays).",
    "",
  ];

  for (const [name, node] of [...simpleTypes.entries()].sort()) {
    const tsName = pascal(name);
    if (complexTypes.has(name)) continue; // complex wins the name
    parts.push(docComment(node, "").trimEnd());
    parts.push(`export type ${tsName} = ${resolveSimpleType(node, [name])};`);
    parts.push("");
  }

  for (const [name, node] of [...complexTypes.entries()].sort()) {
    const tsName = pascal(name);
    const { extendsBase, props } = complexTypeBody(node, [name]);
    parts.push(docComment(node, "").trimEnd());
    if (props.length === 0 && extendsBase) {
      parts.push(`export type ${tsName} = ${extendsBase};`);
    } else if (props.length === 0) {
      parts.push(`export type ${tsName} = Record<string, unknown>;`);
    } else {
      const heritage = extendsBase ? ` extends ${extendsBase}` : "";
      parts.push(`export interface ${tsName}${heritage} {`);
      parts.push(renderProps(props));
      parts.push("}");
    }
    parts.push("");
  }

  // Document roots declared with inline types get their own interfaces so
  // consumers can reference the full parsed document shape.
  for (const [name, node] of [...topLevelElements.entries()].sort()) {
    if ((node.complexType ?? []).length === 0) continue;
    const tsName = `${pascal(name)}Element`;
    const { extendsBase, props } = complexTypeBody(node.complexType[0], [
      `${name}#element`,
    ]);
    parts.push(docComment(node, "").trimEnd());
    if (props.length === 0) {
      parts.push(`export type ${tsName} = Record<string, unknown>;`);
    } else {
      const heritage = extendsBase ? ` extends ${extendsBase}` : "";
      parts.push(`export interface ${tsName}${heritage} {`);
      parts.push(renderProps(props));
      parts.push("}");
    }
    parts.push("");
  }

  const outFile = `src/types/xml/generated/v${version}.ts`;
  writeFileSync(outFile, parts.filter((p) => p !== undefined).join("\n"));
  execSync(`npx prettier --write ${outFile}`, { stdio: "inherit" });
  console.log(
    `  ${simpleTypes.size} simple + ${complexTypes.size} complex types -> ${outFile}`,
  );
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
  emitTypesForVersion(version);
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
