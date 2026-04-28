import { parseArgs } from "node:util";
import { generateAdr } from "./generate-adr";

type CliOptions =
  | { help: true }
  | {
      help: false;
      title: string;
      targetRoot: string;
    };

function printHelp(): void {
  console.log(`create-adr

Usage:
  create-adr "Short decision title" [--path <repositoryRoot>]
  create-adr --title "Short decision title" [--path <repositoryRoot>]
  create-adr --help
`);
}

function parseArguments(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv.slice(2),
    options: {
      help: {
        type: "boolean",
        short: "h",
      },
      title: {
        type: "string",
      },
      path: {
        type: "string",
      },
    },
    allowPositionals: true,
    strict: true,
  });

  if (values.help) {
    return { help: true };
  }

  if (positionals.length > 1) {
    throw new Error(`Unexpected positional arguments: ${positionals.slice(1).join(" ")}`);
  }

  if (values.title && positionals.length > 0) {
    throw new Error("Provide the ADR title either positionally or with --title, not both.");
  }

  return {
    help: false,
    title: values.title || positionals[0] || "",
    targetRoot: values.path || process.cwd(),
  };
}

export function main(argv: string[] = process.argv): void {
  try {
    const options = parseArguments(argv);

    if (options.help) {
      printHelp();
      return;
    }

    if (!options.title || options.title.trim().length === 0) {
      throw new Error("Missing ADR title. Use --title or pass a positional title.");
    }

    const createdFile = generateAdr({
      title: options.title,
      targetRoot: options.targetRoot,
    });

    console.log(`Created ${createdFile}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
