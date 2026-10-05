# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [semver](https://semver.org/).

## [Unreleased]

### Added

- `filters` helpers for all filters enabled in Thumbor by default: `filters.quality(80)`, `filters.format('webp')`, `filters.blur(5)`, `filters.watermark(...)` and others. They return strings for `filter()`.
- `filter()` accepts several calls: `filter(filters.quality(80), filters.format('webp'))`.
- `trim(orientation, tolerance)` for `trim:bottom-right:10`. `trim()` without arguments works as before.
- `meta()`: Thumbor returns JSON with the image size and operations instead of the image.
- `debug()`: Thumbor draws detected focal points.
- `fromUrl(url, { encode: true })` encodes the image url, for source urls with a query string.

## [0.2.0] - 2026-10-05

Generated urls change in some cases, see "Changed". Urls that worked before still work in Thumbor.

### Fixed

- `halign()` and `valign()` produced `LEFT`, `TOP` etc. Thumbor only accepts lowercase and returned an error for these urls.
- `FitInType.ADAPTIVE` produced `adaptative-fit-in`, Thumbor expects `adaptive-fit-in`.
- `FitInType`, `HorizontalPosition` and `VerticalPosition` were declared in types but missing from the JavaScript bundle, so importing them failed at runtime.
- Signing with `key` did not work in browsers, Deno and edge runtimes because it required `node:crypto`. It now uses a built-in HMAC-SHA1. Signatures for the same url are unchanged.
- The ES module build had a bare `import 'crypto'` and could not be loaded in a browser without a bundler.
- `vite` was listed as a runtime dependency and installed together with the package.

### Changed

- The `0x0` segment is no longer added when no size and no flip is set: `/unsafe/0x0/a.jpg` is now `/unsafe/a.jpg`. Signatures and cache keys for these urls change.
- A trailing slash in the server url is removed: `https://host/` no longer produces `https://host//unsafe/...`.
- Builder state is reset even if `buildURL()` throws.

### Added

- `FitInType.ADAPTIVE_FULL` for `adaptive-full-fit-in`.
- `Thumbor` class export.
- `ThumborParameters` type.
- `dist/thumbor-client.iife.js`, a minified build for `<script>` tags with the `ThumborClient` global. `unpkg` and `jsdelivr` fields point to it.
- Separate type declarations for `require()` (`.d.cts`).

### Deprecated

- `Parameters` type, use `ThumborParameters`. The old name shadows TypeScript's built-in `Parameters<T>`.

## [0.1.0] - 2025-06-24

### Fixed

- Signed urls. Up to 0.0.6 the build replaced `crypto` with an empty object and `buildURL()` threw `createHmac is not a function` whenever `key` was set. Now `crypto` is imported at runtime, which works in Node and Bun only.

### Changed

- `vite` was added to runtime dependencies by mistake (fixed in 0.2.0).

## [0.0.7] - 2025-01-25

Published without the `dist` folder and cannot be used.

## [0.0.6] - 2024-04-04

### Fixed

- Package `exports` pointed to `.ts` files.

## [0.0.5] - 2024-04-04

### Added

- `LICENSE` is included in the package.

## [0.0.4] - 2024-04-03

### Fixed

- Type declarations after build.

### Removed

- Internal helpers are no longer exported.

## [0.0.3] - 2024-04-03

### Fixed

- Type declarations were missing from the build.

## [0.0.2] - 2024-04-03

### Added

- Package metadata: keywords, repository links.

## [0.0.1] - 2024-04-03

First release: `createThumbor()`, resize, fit-in, crop, flip, alignment, smart crop, trim, filters, unsafe urls. Signed urls did not work until 0.1.0.

[Unreleased]: https://github.com/azabroflovski/thumbor-client/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/azabroflovski/thumbor-client/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.7...v0.1.0
[0.0.7]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/azabroflovski/thumbor-client/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/azabroflovski/thumbor-client/releases/tag/v0.0.1
