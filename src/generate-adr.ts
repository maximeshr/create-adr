import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildAdrTemplate } from "./template.ts";

interface GenerateAdrInput {
  title: string;
  targetRoot?: string;
}

const ensureAbsoluteRoot = (targetRoot: string): string => {
  const resolvedPath = path.resolve(targetRoot);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Target path does not exist: ${resolvedPath}`);
  }

  const stat = statSync(resolvedPath);

  if (!stat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolvedPath}`);
  }

  return resolvedPath;
};

export const toKebabCase = (input: string): string =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .trim()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-");

export const formatAdrNumber = (value: number): string => String(value).padStart(4, "0");

export const getNextAdrNumber = (adrDirectoryPath: string): string => {
  const files = existsSync(adrDirectoryPath) ? readdirSync(adrDirectoryPath) : [];

  const maxNumber = files.reduce((currentMax, fileName) => {
    const match = /^(\d{4})-/.exec(fileName);
    const capturedNumber = match?.[1];

    if (capturedNumber === undefined) {
      return currentMax;
    }

    return Math.max(currentMax, Number(capturedNumber));
  }, 0);

  return formatAdrNumber(maxNumber + 1);
};

const getIsoDate = (): string => new Date().toISOString().slice(0, 10);

export const generateAdr = ({ title, targetRoot = process.cwd() }: GenerateAdrInput): string => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("ADR title cannot be empty.");
  }

  const repositoryRoot = ensureAbsoluteRoot(targetRoot);
  const adrDirectoryPath = path.join(repositoryRoot, "docs", "adr");
  mkdirSync(adrDirectoryPath, { recursive: true });

  const adrNumber = getNextAdrNumber(adrDirectoryPath);
  const slug = toKebabCase(trimmedTitle);

  if (!slug) {
    throw new Error("ADR title must include at least one alphanumeric character.");
  }

  const filePath = path.join(adrDirectoryPath, `${adrNumber}-${slug}.md`);

  if (existsSync(filePath)) {
    throw new Error(`ADR already exists: ${filePath}`);
  }

  const content = buildAdrTemplate({
    adrNumber,
    title: trimmedTitle,
    date: getIsoDate(),
  });

  writeFileSync(filePath, content, "utf-8");

  return path.relative(repositoryRoot, filePath);
};
