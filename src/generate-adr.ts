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
    .replaceAll(/[\u0300-\u036F]/gu, "")
    .replaceAll(/[^a-z0-9\s-]/gu, "")
    .trim()
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/-+/gu, "-");

export const formatAdrNumber = (value: number): string => String(value).padStart(4, "0");

export const getNextAdrNumber = (adrDirectoryPath: string): string => {
  const files = existsSync(adrDirectoryPath) ? readdirSync(adrDirectoryPath) : [];

  let maxNumber = 0;

  for (const fileName of files) {
    const capturedNumber = /^(?<number>\d{4})-/u.exec(fileName)?.groups?.number;

    if (capturedNumber !== undefined) {
      maxNumber = Math.max(maxNumber, Number(capturedNumber));
    }
  }

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
