# thumbor-client

Thumbor URL builder. Listed in the official Thumbor docs, so URL output and the public API must not change silently.

## Commands

```sh
bun install
bun run test         # vitest, src/**/*.test.ts
bun run typecheck    # tsc for src, then tsconfig.test.json for tests
bun run build        # tsdown -> dist/
bun run test:smoke   # built package via its exports map: esm, cjs, iife
```

Run `build` before `test:smoke`. CI (`.github/workflows/ci.yml`) runs smoke tests on Node 22/24/26, Bun and Deno.

## Layout

- `src/main.ts` - package entry, everything public is exported here
- `src/lib/thumbor.ts` - builder class, URL segment order
- `src/lib/sign.ts` - own sync HMAC-SHA1 + urlsafe base64 (with `=` padding, like Python's `urlsafe_b64encode`)
- `src/lib/enums.ts`, `src/lib/types.ts`
- `test/smoke*` - plain JS, run against `dist/`, not against `src/`
- `tsdown.config.ts` - two builds: esm+cjs with d.ts/d.cts (platform neutral), minified iife with global `ThumborClient`

## Constraints

- No runtime dependencies. No Node or DOM APIs in `src/lib`: `tsconfig.json` has `lib: ES2020` and `types: []` to enforce it. Tests get Node types via `tsconfig.test.json`.
- `buildURL()` must stay synchronous. That rules out WebCrypto, hence `sign.ts`.
- Segment order follows Thumbor's URL regex: `trim / crop / fit-in / size / halign / valign / smart / filters / image`.
- Thumbor expects lowercase `left|center|right`, `top|middle|bottom`, and `adaptive-` (not `adaptative-`).
- Signature changes break every signed URL in production. `sign.ts` is tested against `node:crypto`; keep that test.
- Imports use `.ts` extensions and `import type` (`verbatimModuleSyntax`).

## Style

- Commits: conventional commits (`fix:`, `feat:`, `chore:`, `docs:`, `test:`, `ci:`), no co-author trailer.
- Docs and README: plain, short, with real output. Generate example URLs by running the built package, don't type them by hand.
