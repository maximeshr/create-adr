import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { buildAdrTemplate } from "./template.ts";

type GenerateAdrInput = {
  title: string;
  targetRoot?: string;
};

export function ensureAbsoluteRoot(targetRoot: string): string {
  const resolvedPath = resolve(targetRoot);
  if (!existsSync(resolvedPath)) {
    throw new Error(`Target path does not exist: ${resolvedPath}`);
  }

  const stat = statSync(resolvedPath);
  if (!stat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolvedPath}`);
  }

  return resolvedPath;
}

export function toKebabCase(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatAdrNumber(value: number): string {
  return String(value).padStart(4, "0");
}

export function getNextAdrNumber(adrDirectoryPath: string): string {
  const files = existsSync(adrDirectoryPath) ? readdirSync(adrDirectoryPath) : [];

  const maxNumber = files.reduce((currentMax, fileName) => {
    const match = fileName.match(/^(\d{4})-/);
    const capturedNumber = match?.[1];
    if (capturedNumber === undefined) {
      return currentMax;
    }
    return Math.max(currentMax, Number(capturedNumber));
  }, 0);

  return formatAdrNumber(maxNumber + 1);
}

function getIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateAdr({ title, targetRoot = process.cwd() }: GenerateAdrInput): string {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("ADR title cannot be empty.");
  }

  const repositoryRoot = ensureAbsoluteRoot(targetRoot);
  const adrDirectoryPath = join(repositoryRoot, "docs", "adr");
  mkdirSync(adrDirectoryPath, { recursive: true });

  const adrNumber = getNextAdrNumber(adrDirectoryPath);
  const slug = toKebabCase(trimmedTitle);
  if (!slug) {
    throw new Error("ADR title must include at least one alphanumeric character.");
  }

  const filePath = join(adrDirectoryPath, `${adrNumber}-${slug}.md`);
  if (existsSync(filePath)) {
    throw new Error(`ADR already exists: ${filePath}`);
  }

  const content = buildAdrTemplate({
    adrNumber,
    title: trimmedTitle,
    date: getIsoDate(),
  });

  writeFileSync(filePath, content, "utf8");
  return relative(repositoryRoot, filePath);
}
