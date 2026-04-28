# create-adr

`create-adr` is a small CLI that generates ADR files under `docs/adr/` at the
target repository root.

## Usage

From any repository root (after npm publish):

```sh
npx create-adr "Use URI path versioning for public APIs"
```

or:

```sh
bunx create-adr "Use URI path versioning for public APIs"
```

With explicit title/path flags:

```sh
npx create-adr --title "Use URI path versioning for public APIs" --path /path/to/repository
```

```sh
bunx create-adr --title "Use URI path versioning for public APIs" --path /path/to/repository
```

The command creates:

- `docs/adr/` if missing
- `docs/adr/0001-your-title.md` (or next sequence)

## Generated ADR structure

The generated file includes:

- ADR title (`# ADR-XXXX: ...`)
- status (`proposed`)
- date (`YYYY-MM-DD`)
- context
- decision
- consequences (expected improvements and identified downsides)
- alternatives considered
- links

## Local development

Install dependencies:

```sh
npm install
```

Build CLI output with tsdown:

```sh
npm run build
```

Run tests:

```sh
bun run test
```

Run lint and formatting checks:

```sh
bun run lint
bun run format:check
```

Run locally without publishing:

```sh
node ./bin/create-adr.js "Use URI path versioning for public APIs" --path /path/to/repository
```

## Publish flow

Before publishing:

1. Update version in `package.json`.
2. Run `npm run build`.
3. Run `bun run lint`.
4. Run `bun run format:check`.
5. Run `bun run test`.
6. Validate package contents:
   ```sh
   npm pack
   ```
7. Authenticate with npm:
   ```sh
   npm login
   ```
8. Publish:
   ```sh
   npm publish
   ```

After publish, teams can run both `npx create-adr ...` and `bunx create-adr ...`.
