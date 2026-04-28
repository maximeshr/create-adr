import fs from "node:fs";
import path from "node:path";
import { buildAdrTemplate } from "./template";

type GenerateAdrInput = {
  title: string;
  targetRoot?: string;
};

export function ensureAbsoluteRoot(targetRoot: string): string {
  const resolvedPath = path.resolve(targetRoot);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Target path does not exist: ${resolvedPath}`);
  }

  const stat = fs.statSync(resolvedPath);
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
  const files = fs.existsSync(adrDirectoryPath) ? fs.readdirSync(adrDirectoryPath) : [];

  const maxNumber = files.reduce((currentMax, fileName) => {
    const match = fileName.match(/^(\d{4})-/);
    if (!match) {
      return currentMax;
    }
    return Math.max(currentMax, Number(match[1]));
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
  const adrDirectoryPath = path.join(repositoryRoot, "docs", "adr");
  fs.mkdirSync(adrDirectoryPath, { recursive: true });

  const adrNumber = getNextAdrNumber(adrDirectoryPath);
  const slug = toKebabCase(trimmedTitle);
  if (!slug) {
    throw new Error("ADR title must include at least one alphanumeric character.");
  }

  const filePath = path.join(adrDirectoryPath, `${adrNumber}-${slug}.md`);
  if (fs.existsSync(filePath)) {
    throw new Error(`ADR already exists: ${filePath}`);
  }

  const content = buildAdrTemplate({
    adrNumber,
    title: trimmedTitle,
    date: getIsoDate(),
  });

  fs.writeFileSync(filePath, content, "utf8");
  return path.relative(repositoryRoot, filePath);
}
