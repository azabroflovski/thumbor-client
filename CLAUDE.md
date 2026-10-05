# thumbor-client

Thumbor URL builder. Listed in the official Thumbor docs, so URL output and the public API must not change silently.

## Commands

```sh
bun install
bun run test         # vitest, src/**/*.test.ts
bun run typecheck    # tsc for src, then tsconfig.test.json for tests
bun run build        # tsdown -> dist/
bun run test:smoke   # built package via its exports map: esm, cjs, iife, umd
bun run dev          # demo/ playground on vite, imports from src/
bun run thumbor      # local thumbor on :8888 (compose.yaml, thumbor.conf)
bun run test:live    # built package against the local thumbor
```

Run `build` before `test:smoke` and `test:live`. CI runs smoke tests on Node 22/24/26, Bun and Deno, and `test:live` against the same compose setup.

## Layout

- `src/main.ts` - package entry, everything public is exported here
- `src/lib/thumbor.ts` - builder class, URL segment order
- `src/lib/sign.ts` - own sync HMAC-SHA1 + urlsafe base64 (with `=` padding, like Python's `urlsafe_b64encode`)
- `src/lib/enums.ts`, `src/lib/types.ts`
- `test/smoke*`, `test/live.mjs` - plain JS, run against `dist/` through the package name, not against `src/`
- `demo/` - playground, deployed to GitHub Pages by `.github/workflows/demo.yml`
- `tsdown.config.ts` - esm+cjs with d.ts/d.cts (platform neutral); minified iife and umd with global `ThumborClient`. The umd file name `thumbor-client.umd.cjs` is kept because 0.1.0 and earlier pointed `main` at it, so CDN links to it exist

## Constraints

- No runtime dependencies. No Node or DOM APIs in `src/lib`: `tsconfig.json` has `lib: ES2020` and `types: []` to enforce it. Tests get Node types via `tsconfig.test.json`.
- `buildURL()` must stay synchronous. That rules out WebCrypto, hence `sign.ts`.
- Segment order follows Thumbor's URL regex: `trim / crop / fit-in / size / halign / valign / smart / filters / image`.
- Thumbor expects lowercase `left|center|right`, `top|middle|bottom`, and `adaptive-` (not `adaptative-`).
- Thumbor 7 returns 500 for `orig` combined with `0` (server bug, `float('orig')`). Not ours, don't "fix" it in the builder.
- Signature changes break every signed URL in production. `sign.ts` is tested against `node:crypto`; keep that test.
- Imports use `.ts` extensions and `import type` (`verbatimModuleSyntax`).

## Changelog and releases

- `CHANGELOG.md` follows Keep a Changelog. Every user-visible change gets a line under `## [Unreleased]` in the same commit or PR, in one of: Added, Changed, Deprecated, Removed, Fixed, Security.
- Write what the user of the package sees, not what was done in the repo. Tooling, CI and refactoring don't go there unless they change the published package.
- Anything that changes generated urls goes under Changed, even if it is a fix: it changes signatures and CDN cache keys.
- Release: `bun run release <version>` (moves Unreleased, bumps package.json, commits, tags), then `git push --follow-tags`. `.github/workflows/release.yml` runs all checks, publishes to npm with provenance and creates the GitHub release from the changelog section.
- Versions: patch for fixes that don't change urls, minor for new options or url changes while on 0.x.

## Style

- Commits: conventional commits (`fix:`, `feat:`, `chore:`, `docs:`, `test:`, `ci:`), no co-author trailer.
- Docs and README: plain, short, with real output. Generate example URLs by running the built package, don't type them by hand.
