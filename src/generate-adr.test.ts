import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { formatAdrNumber, generateAdr, getNextAdrNumber, toKebabCase } from "./generate-adr.ts";

const createTempDirectory = (): string => mkdtempSync(path.join(tmpdir(), "create-adr-"));

describe("generate ADR", () => {
  it("toKebabCase converts title to predictable slug", () => {
    expect(toKebabCase("Use URI path versioning")).toBe("use-uri-path-versioning");
    expect(toKebabCase("  Café API -- v2 ")).toBe("cafe-api-v2");
  });

  it("formatAdrNumber keeps 4-digit numbering", () => {
    expect(formatAdrNumber(1)).toBe("0001");
    expect(formatAdrNumber(42)).toBe("0042");
    expect(formatAdrNumber(1000)).toBe("1000");
  });

  it("getNextAdrNumber returns next sequence from existing files", () => {
    const tempRoot = createTempDirectory();
    const adrDir = path.join(tempRoot, "docs", "adr");
    mkdirSync(adrDir, { recursive: true });
    writeFileSync(path.join(adrDir, "0001-first.md"), "", "utf-8");
    writeFileSync(path.join(adrDir, "0003-third.md"), "", "utf-8");

    expect(getNextAdrNumber(adrDir)).toBe("0004");
  });

  it("generateAdr creates full ADR file under docs/adr", () => {
    const tempRoot = createTempDirectory();

    const relativePath = generateAdr({
      title: "Use URI path versioning for public APIs",
      targetRoot: tempRoot,
    });

    expect(relativePath).toBe(
      path.join("docs", "adr", "0001-use-uri-path-versioning-for-public-apis.md"),
    );

    const absolutePath = path.join(tempRoot, relativePath);
    expect(existsSync(absolutePath)).toBeTruthy();

    const content = readFileSync(absolutePath, "utf-8");
    expect(content).toMatch(/^# ADR-0001: Use URI path versioning for public APIs/mu);
    expect(content).toMatch(/- Status: proposed/u);
  });

  it("generateAdr writes every template section in order", () => {
    const tempRoot = createTempDirectory();
    const relativePath = generateAdr({ title: "Record the decision", targetRoot: tempRoot });
    const content = readFileSync(path.join(tempRoot, relativePath), "utf-8");

    expect(content.match(/^#{2,3} .+$/gmu)).toStrictEqual([
      "## Context",
      "## Decision",
      "## Consequences",
      "### Expected improvements",
      "### Identified downsides",
      "## Alternatives considered",
      "## Links",
    ]);
  });

  it("generateAdr throws when title has no valid characters", () => {
    const tempRoot = createTempDirectory();
    expect(() => generateAdr({ title: "!!!", targetRoot: tempRoot })).toThrow(
      /at least one alphanumeric character/u,
    );
  });
});
