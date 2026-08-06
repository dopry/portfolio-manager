import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIProperty } from "../Mocks.js";
import { serializePropertyBundle } from "../PropertyBundle.js";
import {
  setupCliHarness,
  type CliHarness,
} from "../test/cli/cliTestHarness.js";
import {
  PROPERTY_BUNDLE_FORMAT,
  PROPERTY_BUNDLE_SCHEMA,
  PROPERTY_BUNDLE_VERSION,
} from "../types/index.js";

describe("property import/export CLI commands", () => {
  let harness: CliHarness;
  let temporaryDirectory: string | undefined;

  beforeEach(() => {
    harness = setupCliHarness();
  });

  afterEach(async () => {
    harness.restore();
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      temporaryDirectory = undefined;
    }
  });

  it("exports explicit property ids to stdout", async () => {
    const bundle = {
      $schema: PROPERTY_BUNDLE_SCHEMA,
      capabilities: ["property"] as ["property"],
      format: PROPERTY_BUNDLE_FORMAT,
      formatVersion: PROPERTY_BUNDLE_VERSION,
      properties: [{ ref: "property:1", property: mockIProperty() }],
    };
    harness.fakeClient.exportProperties.mockResolvedValueOnce(bundle);

    await harness.parseCli(["property", "export", "--indent", "0", "20", "10"]);

    expect(harness.fakeClient.exportProperties).toHaveBeenCalledWith([20, 10]);
    expect(console.log).toHaveBeenCalledWith(
      serializePropertyBundle(bundle, 0),
    );
  });

  it("resolves --all through the accessible property list", async () => {
    harness.fakeClient.getProperties.mockResolvedValueOnce([
      { id: 3 },
      { id: 4 },
    ]);
    harness.fakeClient.exportProperties.mockResolvedValueOnce({
      $schema: PROPERTY_BUNDLE_SCHEMA,
      format: PROPERTY_BUNDLE_FORMAT,
      formatVersion: PROPERTY_BUNDLE_VERSION,
      capabilities: ["property"],
      properties: [{ ref: "property:1", property: mockIProperty() }],
    });

    await harness.parseCli(["property", "export", "--all"]);

    expect(harness.fakeClient.exportProperties).toHaveBeenCalledWith([3, 4]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('\n  "$schema"'),
    );
  });

  it("reports an empty accessible property list clearly", async () => {
    harness.fakeClient.getProperties.mockResolvedValueOnce([]);

    await expect(
      harness.parseCli(["property", "export", "--all"]),
    ).rejects.toThrow("No accessible properties found to export");
    expect(harness.fakeClient.exportProperties).not.toHaveBeenCalled();
  });

  it("requires exactly one property selection mode", async () => {
    await expect(harness.parseCli(["property", "export"])).rejects.toThrow(
      "either one or more property ids or --all",
    );
    await expect(
      harness.parseCli(["property", "export", "--all", "10"]),
    ).rejects.toThrow("either one or more property ids or --all");
  });

  it("does not overwrite an export unless --force is provided", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "pm-bundle-"));
    const file = join(temporaryDirectory, "property.json");
    await writeFile(file, "existing", "utf8");
    const bundle = {
      $schema: PROPERTY_BUNDLE_SCHEMA,
      format: PROPERTY_BUNDLE_FORMAT,
      formatVersion: PROPERTY_BUNDLE_VERSION,
      capabilities: ["property"] as ["property"],
      properties: [{ ref: "property:1", property: mockIProperty() }],
    };
    harness.fakeClient.exportProperties.mockResolvedValue(bundle);

    await expect(
      harness.parseCli(["property", "export", "--output", file, "10"]),
    ).rejects.toMatchObject({ code: "EEXIST" });
    await expect(readFile(file, "utf8")).resolves.toBe("existing");

    await harness.parseCli([
      "property",
      "export",
      "--output",
      file,
      "--force",
      "10",
    ]);
    await expect(readFile(file, "utf8")).resolves.toContain(
      PROPERTY_BUNDLE_FORMAT,
    );
  });

  it("reads an import bundle and forwards safety options", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "pm-bundle-"));
    const file = join(temporaryDirectory, "property.json");
    const bundle = { format: PROPERTY_BUNDLE_FORMAT, formatVersion: 1 };
    await writeFile(file, JSON.stringify(bundle), "utf8");
    harness.fakeClient.importProperties.mockResolvedValueOnce({
      status: "dry-run",
      properties: [],
    });

    await harness.parseCli([
      "property",
      "import",
      file,
      "--account-id",
      "55",
      "--dry-run",
      "--keep-partial",
      "--name-prefix",
      "Copy ",
    ]);

    expect(harness.fakeClient.importProperties).toHaveBeenCalledWith(bundle, {
      accountId: 55,
      dryRun: true,
      keepPartial: true,
      namePrefix: "Copy ",
      nameSuffix: undefined,
    });
  });

  it("reads an import bundle from stdin and marks failed imports", async () => {
    vi.spyOn(process, "stdin", "get").mockReturnValue(
      Readable.from([
        Buffer.from('{"format":"'),
        `${PROPERTY_BUNDLE_FORMAT}"}`,
      ]) as never,
    );
    harness.fakeClient.importProperties.mockResolvedValueOnce({
      status: "failed",
      error: "create failed",
      properties: [],
    });

    await harness.parseCli(["property", "import", "-", "--indent", "2"]);

    expect(harness.fakeClient.importProperties).toHaveBeenCalledWith(
      { format: PROPERTY_BUNDLE_FORMAT },
      expect.any(Object),
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        {
          status: "failed",
          error: "create failed",
          properties: [],
        },
        null,
        2,
      ),
    );
    expect(process.exitCode).toBe(1);
  });

  it("reports invalid JSON from files and non-Error parse failures", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "pm-bundle-"));
    const file = join(temporaryDirectory, "property.json");
    await writeFile(file, "not json", "utf8");

    await expect(
      harness.parseCli(["property", "import", file]),
    ).rejects.toThrow(`Invalid JSON in ${file}`);

    await writeFile(file, "{}", "utf8");
    const parse = JSON.parse;
    vi.spyOn(JSON, "parse").mockImplementation((raw: string) => {
      if (raw === "{}") throw "parse failed";
      return parse(raw) as unknown;
    });
    await expect(
      harness.parseCli(["property", "import", file]),
    ).rejects.toThrow("parse failed");
  });

  it("renders help for both commands", async () => {
    await harness.parseCliHelp(["property", "export"]);
    await harness.parseCliHelp(["property", "import"]);
  });
});
