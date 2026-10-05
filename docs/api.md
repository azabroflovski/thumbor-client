# API reference

## createThumbor

```ts
function createThumbor(options: ThumborClientOptions): Thumbor

interface ThumborClientOptions {
  url: string  // Thumbor server, trailing slash is ignored
  key?: string // SECURITY_KEY; without it urls are unsafe
}
```

## Thumbor

Every method except `buildURL()` returns the same instance for chaining.

| Method | Url segment | Guide |
|---|---|---|
| `fromUrl(url, { encode? })` | image url, encoded with `encode: true` | [Image source](/guide/image-source) |
| `setPath(path)` | image path, leading `/` removed | [Image source](/guide/image-source#path) |
| `resize(width, height)` | `300x200`, `300x0`, `origx200` | [Resize](/guide/resize-and-crop#resize) |
| `fitIn(width, height, type?)` | `fit-in/800x600` and variants | [fitIn](/guide/resize-and-crop#fitin) |
| `flipHorizontally()` | `-300x200` | [flip](/guide/resize-and-crop#flip) |
| `flipVertically()` | `300x-200` | [flip](/guide/resize-and-crop#flip) |
| `crop({ left, top, right, bottom })` | `10x20:410x320` | [crop](/guide/resize-and-crop#crop) |
| `halign(HorizontalPosition)` | `left`, `center`, `right` | [Alignment](/guide/resize-and-crop#alignment) |
| `valign(VerticalPosition)` | `top`, `middle`, `bottom` | [Alignment](/guide/resize-and-crop#alignment) |
| `smartCrop(enabled = true)` | `smart` | [Smart crop](/guide/resize-and-crop#smart-crop) |
| `trim(orientation?, tolerance?)` | `trim`, `trim:bottom-right:10` | [trim](/guide/resize-and-crop#trim) |
| `filter(...calls)` | `filters:quality(80):format(webp)` | [Filters](/guide/filters) |
| `meta(enabled = true)` | `meta` | [meta](/guide/meta-and-debug#meta) |
| `debug(enabled = true)` | `debug` | [debug](/guide/meta-and-debug#debug) |
| `buildURL()` | returns the url and resets the builder | |

Segment order in the url: `debug/meta/trim/crop/fit-in/size/halign/valign/smart/filters/image`.

## filters

Functions that return filter calls for `filter()`. Full list with arguments: [Filters](/guide/filters).

## Enums

```ts
enum FitInType {
  DEFAULT = 'DEFAULT',             // fit-in
  FULL = 'FULL',                   // full-fit-in
  ADAPTIVE = 'ADAPTIVE',           // adaptive-fit-in
  ADAPTIVE_FULL = 'ADAPTIVE_FULL'  // adaptive-full-fit-in
}

enum HorizontalPosition { LEFT = 'left', CENTER = 'center', RIGHT = 'right' }
enum VerticalPosition { TOP = 'top', MIDDLE = 'middle', BOTTOM = 'bottom' }
```

## Types

```ts
type TrimOrientation = 'top-left' | 'bottom-right'
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png' | 'gif' | 'heic' | 'heif'
type WatermarkPosition = number | `${number}p` | 'center' | 'repeat'

interface WindowSizeAndPosition { left: number; top: number; right: number; bottom: number }
interface FromUrlOptions { encode?: boolean }
```

`ThumborParameters` describes the builder state. `Parameters` is its deprecated old name.
