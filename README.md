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

Pull requests target `canary`, the default branch; `main` is the released state. Each user-facing change adds a changeset (`vp exec changeset`); internal pull requests (`ci`, `build`, `test`, `docs`, `chore`) do not need one. On every push to `canary`, the Release workflow opens or updates the `canary` → `main` release pull request with the full release notes. Merging it (merge commit) versions the package, updates `CHANGELOG.md`, publishes to npm with provenance, tags `vX.Y.Z` and creates the GitHub release. The flow comes from [quality-gate](https://github.com/maximeshr/quality-gate).

Never edit the version in `package.json` or push release tags by hand: `vp run check:version` fails CI and the Release workflow when the version is neither published nor in `CHANGELOG.md`.

CI runs `pnpm audit --audit-level=high` on every pull request, every push to `canary` and `main`, and weekly, because Dependabot does not raise alerts on a pnpm 12 lockfile.

## License

MIT
