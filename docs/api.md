# API reference

## createThumbor

```ts
function createThumbor(options: ThumborClientOptions): Thumbor

interface ThumborClientOptions {
  url: string  // Thumbor server, trailing slash is ignored
  key?: string // SECURITY_KEY; without it urls are unsafe
}
```

## thumbor.image

```ts
thumbor.image(src: string, options?: { encode?: boolean }): ThumborImage
```

`src` is an image url or a path. A leading `/` is removed from paths. `encode: true` applies `encodeURIComponent`, for urls with a query string. See [Image source](/guide/image-source).

## ThumborImage

Immutable: every method returns a new `ThumborImage`.

| Method | Url segment | Guide |
|---|---|---|
| `resize(width, height)` | `300x200`, `300x0`, `origx200` | [resize](/guide/resize-and-crop#resize) |
| `fitIn(width, height, { full?, adaptive? })` | `fit-in`, `full-fit-in`, `adaptive-fit-in`, `adaptive-full-fit-in` | [fitIn](/guide/resize-and-crop#fitin) |
| `flip('horizontal' \| 'vertical' \| 'both')` | `-300x200`, `300x-200`, `-300x-200` | [flip](/guide/resize-and-crop#flip) |
| `crop({ left, top, right, bottom })` | `10x20:410x320` | [crop](/guide/resize-and-crop#crop) |
| `align(horizontal?, vertical?)` | `left/top` | [align](/guide/resize-and-crop#align) |
| `smart(enabled = true)` | `smart` | [smart](/guide/resize-and-crop#smart) |
| `trim(orientation?, tolerance?)` | `trim`, `trim:bottom-right:10` | [trim](/guide/resize-and-crop#trim) |
| `meta(enabled = true)` | `meta` | [meta](/guide/meta-and-debug#meta) |
| `debug(enabled = true)` | `debug` | [debug](/guide/meta-and-debug#debug) |
| `filter(...calls)` | `filters:quality(80):format(webp)` | [Filters](/guide/filters) |
| `quality(80)`, `format('webp')`, ... | one method per filter | [Filters](/guide/filters) |
| `url()` | the url | |
| `srcset(widths)` | `url 400w, url 800w` | [srcset](/guide/getting-started#srcset) |
| `toString()`, `toJSON()` | the url | [Image as a string](/guide/getting-started#image-as-a-string) |

Segment order in the url: `debug/meta/trim/crop/fit-in/size/halign/valign/smart/filters/image`.

## filters

Functions that return filter strings for `filter()`: `filters.quality(80)` → `'quality(80)'`. The same names and arguments as the filter methods. See [Filters](/guide/filters).

## Types

```ts
type Size = number | 'orig'
type HorizontalAlign = 'left' | 'center' | 'right'
type VerticalAlign = 'top' | 'middle' | 'bottom'
type FlipDirection = 'horizontal' | 'vertical' | 'both'
type TrimOrientation = 'top-left' | 'bottom-right'
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png' | 'gif' | 'heic' | 'heif'
type WatermarkPosition = number | `${number}p` | 'center' | 'repeat'

interface FitInOptions { full?: boolean; adaptive?: boolean }
interface ImageOptions { encode?: boolean }
interface WindowSizeAndPosition { left: number; top: number; right: number; bottom: number }
```

## Enums

`FitInType`, `HorizontalPosition` and `VerticalPosition` are kept from the old API. `fitIn()` and `align()` accept them too.

## Deprecated

The chain methods on the client itself, from 0.3 and earlier: `fromUrl`, `setPath`, `resize`, `fitIn`, `flipHorizontally`, `flipVertically`, `crop`, `halign`, `valign`, `smartCrop`, `trim`, `meta`, `debug`, `filter`, `buildURL`, `defaultParameters`. They keep working. See [Migrating](/guide/migration).
