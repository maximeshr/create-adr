# create-adr

`create-adr` is a small CLI that generates ADR files under `docs/adr/` at the
target repository root.

Requires Node.js 22.12 or later.

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

Development uses Node.js 26 (pinned in `devEngines`). CI also runs the tests on Node.js 22 and 24, and starts the built CLI on Node.js 22.12, the minimum in `engines`.

`vp run check:package` (after `vp pack`) checks the tarball npm receives with [publint](https://publint.dev) and [Are the Types Wrong?](https://arethetypeswrong.github.io). CI and the Release workflow run it before anything is published.

Run the CLI from source, or the packed bin after `vp pack`:

```sh
node ./src/cli.ts "Use URI path versioning for public APIs" --path /path/to/repository
node ./dist/cli.mjs --help
```

Releases use [changesets](https://github.com/changesets/changesets). Describe each user-facing change with `vp exec changeset`. On `main`, the Release workflow opens a "Version Packages" pull request that bumps the version and updates `CHANGELOG.md`; merging it publishes to npm and creates the `vX.Y.Z` tag.

Never edit the version in `package.json` or push release tags by hand: `vp run check:version` fails CI and the Release workflow when the version is neither published nor in `CHANGELOG.md`.

CI runs `pnpm audit --audit-level=high` on every pull request, every push to `main`, and weekly, because Dependabot does not raise alerts on a pnpm 12 lockfile.

## License

MIT
