import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vite-plus/test";

const cliPath = fileURLToPath(new URL("./cli.ts", import.meta.url));

type CliResult = {
  stdout: string;
  stderr: string;
  status: number;
};

function runCli(args: string[]): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { stdout, stderr: "", status: 0 };
  } catch (error) {
    if (!(error instanceof Error) || !("status" in error)) {
      throw error;
    }
    const failure = error as Error & { status: number; stdout: string; stderr: string };
    return {
      stdout: failure.stdout,
      stderr: failure.stderr,
      status: failure.status,
    };
  }
}

describe("create-adr CLI", () => {
  let targetRoot = "";

  afterEach(() => {
    if (targetRoot) {
      rmSync(targetRoot, { recursive: true, force: true });
    }
  });

  function createTargetRoot(): string {
    targetRoot = mkdtempSync(join(tmpdir(), "create-adr-cli-"));
    return targetRoot;
  }

  it("writes an ADR in the target directory", () => {
    const root = createTargetRoot();
    const result = runCli(["Use URI path versioning for public APIs", "--path", root]);
    const relativePath = join("docs", "adr", "0001-use-uri-path-versioning-for-public-apis.md");

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(`Created ${relativePath}`);

    const content = readFileSync(join(root, relativePath), "utf8");
    expect(content).toMatch(/^# ADR-0001: Use URI path versioning for public APIs/m);
    expect(content).toMatch(/- Status: proposed/);
  });

  it("accepts the title from --title", () => {
    const root = createTargetRoot();
    const result = runCli(["--title", "Record the decision", "--path", root]);

    expect(result.status).toBe(0);
    expect(existsSync(join(root, "docs", "adr", "0001-record-the-decision.md"))).toBe(true);
  });

  it("fails when the title is missing and writes nothing", () => {
    const root = createTargetRoot();
    const result = runCli(["--path", root]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Missing ADR title/);
    expect(existsSync(join(root, "docs", "adr"))).toBe(false);
  });

  it("fails when the title is passed twice", () => {
    const root = createTargetRoot();
    const result = runCli(["Positional title", "--title", "Flag title", "--path", root]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not both/);
    expect(existsSync(join(root, "docs", "adr"))).toBe(false);
  });

  it("prints help and writes nothing", () => {
    const root = createTargetRoot();
    const result = runCli(["--help", "--path", root]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Usage:/);
    expect(existsSync(join(root, "docs", "adr"))).toBe(false);
  });
});
