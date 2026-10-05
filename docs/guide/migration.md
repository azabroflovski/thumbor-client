# Migrating from buildURL()

0.4 adds `thumbor.image(src)`. The old chain methods on the client keep working, nothing has to change at once. They are marked deprecated, so editors show them struck through.

Both APIs produce the same urls and signatures for the same operations, this is checked in tests. Switching does not change urls, CDN cache keys stay the same.

## Why

The old builder keeps its state on the client until `buildURL()`. If a chain stops halfway, after an exception, an early `return` or a missing `buildURL()`, the next url gets the leftover operations. `image()` returns a new object on every call, so nothing is shared.

## Changes

| Before | After |
|---|---|
| `thumbor.fromUrl(url)` | `thumbor.image(url)` |
| `thumbor.fromUrl(url, { encode: true })` | `thumbor.image(url, { encode: true })` |
| `thumbor.setPath(path)` | `thumbor.image(path)` |
| `.buildURL()` | `.url()` |
| `.smartCrop()` | `.smart()` |
| `.fitIn(w, h, FitInType.FULL)` | `.fitIn(w, h, { full: true })` |
| `.fitIn(w, h, FitInType.ADAPTIVE)` | `.fitIn(w, h, { adaptive: true })` |
| `.fitIn(w, h, FitInType.ADAPTIVE_FULL)` | `.fitIn(w, h, { adaptive: true, full: true })` |
| `.flipHorizontally()` | `.flip('horizontal')` |
| `.flipVertically()` | `.flip('vertical')` |
| `.flipHorizontally().flipVertically()` | `.flip('both')` |
| `.halign(HorizontalPosition.LEFT)` | `.align('left')` |
| `.valign(VerticalPosition.TOP)` | `.align(undefined, 'top')` |
| `.halign(...).valign(...)` | `.align('left', 'top')` |
| `.filter(filters.quality(80))` | `.quality(80)`, or keep `.filter(...)` |

`resize`, `crop`, `trim`, `meta`, `debug` and `filter` have the same arguments.

## Example

```ts
// before
const url = thumbor
  .fromUrl(src)
  .fitIn(800, 600, FitInType.FULL)
  .halign(HorizontalPosition.LEFT)
  .smartCrop()
  .filter('quality(80)')
  .buildURL()

// after
const url = thumbor
  .image(src)
  .fitIn(800, 600, { full: true })
  .align('left')
  .smart()
  .quality(80)
  .url()
```

## What's removed when

Nothing in 0.x and 1.x. The old methods can be removed in 2.0 at the earliest.
