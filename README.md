# create-adr

`create-adr` is a small CLI that generates ADR files under `docs/adr/` at the
target repository root.

Requires Node.js 26 or later.

## Usage

From any repository root (after npm publish):

```sh
npx create-adr "Use URI path versioning for public APIs"
```

or:

```sh
pnpm dlx create-adr "Use URI path versioning for public APIs"
```

With explicit title/path flags:

```sh
npx create-adr --title "Use URI path versioning for public APIs" --path /path/to/repository
```

```sh
pnpm dlx create-adr --title "Use URI path versioning for public APIs" --path /path/to/repository
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

The toolchain is [Vite+](https://viteplus.dev) (`vp`). Dependencies are managed with [pnpm](https://pnpm.io).

```sh
vp install
vp check
vp test
vp pack
```

Run the CLI from source, or the packed bin after `vp pack`:

```sh
node ./src/cli.ts "Use URI path versioning for public APIs" --path /path/to/repository
node ./dist/cli.mjs --help
```

## Releases

Releases use [changesets](https://github.com/changesets/changesets). Describe each user-facing change with `vp exec changeset`. On `main`, the Release workflow opens a "Version Packages" pull request that bumps the version and updates `CHANGELOG.md`; merging it publishes to npm and creates the `vX.Y.Z` tag.

Do not edit the version in `package.json` or push release tags by hand: `vp run check:version` fails when the version is neither published nor in `CHANGELOG.md`.

CI runs `pnpm audit --audit-level=high` on every pull request and every push to `main` (Ubuntu), and weekly.

## License

MIT
