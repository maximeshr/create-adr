import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatAdrNumber, generateAdr, getNextAdrNumber, toKebabCase } from "./generate-adr";

function createTempDirectory(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-adr-"));
}

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
    fs.mkdirSync(adrDir, { recursive: true });
    fs.writeFileSync(path.join(adrDir, "0001-first.md"), "", "utf8");
    fs.writeFileSync(path.join(adrDir, "0003-third.md"), "", "utf8");

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
    expect(fs.existsSync(absolutePath)).toBe(true);

    const content = fs.readFileSync(absolutePath, "utf8");
    expect(content).toMatch(/^# ADR-0001: Use URI path versioning for public APIs/m);
    expect(content).toMatch(/- Status: proposed/);
    expect(content).toMatch(/## Context/);
    expect(content).toMatch(/## Decision/);
    expect(content).toMatch(/## Consequences/);
    expect(content).toMatch(/### Expected improvements/);
    expect(content).toMatch(/### Identified downsides/);
    expect(content).toMatch(/## Alternatives considered/);
    expect(content).toMatch(/## Links/);
  });

  it("generateAdr throws when title has no valid characters", () => {
    const tempRoot = createTempDirectory();
    expect(() => generateAdr({ title: "!!!", targetRoot: tempRoot })).toThrow(
      /at least one alphanumeric character/,
    );
  });
});
