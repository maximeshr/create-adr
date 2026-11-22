import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vite-plus/test";

const cliPath = fileURLToPath(new URL("cli.ts", import.meta.url));

interface CliResult {
  stdout: string;
  stderr: string;
  status: number;
}

const isExecFailure = (error: unknown): error is Error & CliResult =>
  error instanceof Error &&
  "status" in error &&
  typeof error.status === "number" &&
  "stdout" in error &&
  typeof error.stdout === "string" &&
  "stderr" in error &&
  typeof error.stderr === "string";

const runCli = (args: string[]): CliResult => {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    return { stdout, stderr: "", status: 0 };
  } catch (error) {
    if (!isExecFailure(error)) {
      throw error;
    }

    return { stdout: error.stdout, stderr: error.stderr, status: error.status };
  }
};

describe("create-adr CLI", () => {
  let targetRoot = "";

  afterEach(() => {
    if (targetRoot) {
      rmSync(targetRoot, { recursive: true, force: true });
    }
  });

  const createTargetRoot = (): string => {
    targetRoot = mkdtempSync(path.join(tmpdir(), "create-adr-cli-"));

    return targetRoot;
  };

  it("writes an ADR in the target directory", () => {
    const root = createTargetRoot();
    const result = runCli(["Use URI path versioning for public APIs", "--path", root]);

    const relativePath = path.join(
      "docs",
      "adr",
      "0001-use-uri-path-versioning-for-public-apis.md",
    );

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(`Created ${relativePath}`);

    const content = readFileSync(path.join(root, relativePath), "utf-8");
    expect(content).toMatch(/^# ADR-0001: Use URI path versioning for public APIs/mu);
    expect(content).toMatch(/- Status: proposed/u);
  });

  it("accepts the title from --title", () => {
    const root = createTargetRoot();
    const result = runCli(["--title", "Record the decision", "--path", root]);

    expect(result.status).toBe(0);
    expect(existsSync(path.join(root, "docs", "adr", "0001-record-the-decision.md"))).toBeTruthy();
  });

  it("fails when the title is missing and writes nothing", () => {
    const root = createTargetRoot();
    const result = runCli(["--path", root]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Missing ADR title/u);
    expect(existsSync(path.join(root, "docs", "adr"))).toBeFalsy();
  });

  it("fails when the title is passed twice", () => {
    const root = createTargetRoot();
    const result = runCli(["Positional title", "--title", "Flag title", "--path", root]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not both/u);
    expect(existsSync(path.join(root, "docs", "adr"))).toBeFalsy();
  });

  it("prints help and writes nothing", () => {
    const root = createTargetRoot();
    const result = runCli(["--help", "--path", root]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Usage:/u);
    expect(existsSync(path.join(root, "docs", "adr"))).toBeFalsy();
  });
});
