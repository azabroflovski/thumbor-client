# thumbor-client

URL builder for [Thumbor](https://www.thumbor.org/). TypeScript, no dependencies, ~2 KB gzipped.

Works in Node, Bun, Deno, Cloudflare Workers and browsers. `buildURL()` is synchronous everywhere, signing included, so it can be called during SSR or in templates.

## Install

```sh
npm i thumbor-client
# or
bun add thumbor-client
# or
deno add npm:thumbor-client
```

## Usage

```ts
import { createThumbor } from 'thumbor-client'

const thumbor = createThumbor({
  url: 'https://thumbor.example.com',
  key: 'secret' // optional, omit for unsafe urls
})

thumbor
  .fromUrl('https://cataas.com/cat')
  .resize(300, 200)
  .smartCrop()
  .buildURL()
// https://thumbor.example.com/BHXj4E9HQX8RkVGdEhO1tua9QdI=/300x200/smart/https://cataas.com/cat
```

Without `key` the url is unsafe:

```
https://thumbor.example.com/unsafe/300x200/smart/https://cataas.com/cat
```

`buildURL()` resets the builder, so one client can be reused for many images.

### Fit-in, filters

```ts
import { createThumbor, FitInType } from 'thumbor-client'

thumbor
  .setPath('photos/cat.jpg')
  .fitIn(800, 600, FitInType.FULL)
  .filter('quality(80)')
  .filter('format(webp)')
  .buildURL()
// https://thumbor.example.com/unsafe/full-fit-in/800x600/filters:quality(80):format(webp)/photos/cat.jpg
```

### Manual crop and alignment

```ts
import { HorizontalPosition, VerticalPosition } from 'thumbor-client'

thumbor
  .setPath('photos/cat.jpg')
  .crop({ left: 10, top: 20, right: 410, bottom: 320 })
  .resize(200, 150)
  .halign(HorizontalPosition.LEFT)
  .valign(VerticalPosition.TOP)
  .buildURL()
// https://thumbor.example.com/unsafe/10x20:410x320/200x150/left/top/photos/cat.jpg
```

## API

| Method | Thumbor segment |
|---|---|
| `fromUrl(url)` | image url as is |
| `setPath(path)` | image path, leading `/` removed |
| `resize(width, height)` | `300x200`; `0` keeps proportions, `'orig'` keeps original size |
| `fitIn(width, height, type?)` | `fit-in`, `full-fit-in`, `adaptive-fit-in`, `adaptive-full-fit-in` |
| `flipHorizontally()` / `flipVertically()` | `-300x-200` |
| `crop({ left, top, right, bottom })` | `10x20:410x320` |
| `halign(HorizontalPosition)` | `left`, `center`, `right` |
| `valign(VerticalPosition)` | `top`, `middle`, `bottom` |
| `smartCrop(enabled = true)` | `smart` |
| `trim()` | `trim` |
| `filter(call)` | `filters:quality(80):...`, see [Thumbor filters](https://thumbor.readthedocs.io/en/latest/filters.html) |
| `buildURL()` | returns the url and resets the builder |

Image urls are not encoded. If the source url has a query string, encode it yourself with `encodeURIComponent`.

## Security key in the browser

The library can sign urls in the browser, but any key shipped to the browser is public. Sign on the server and pass ready urls to the client, or use unsafe urls with a Thumbor instance that allows them.

## Browser without a bundler

ES module:

```html
<script type="module">
  import { createThumbor } from 'https://cdn.jsdelivr.net/npm/thumbor-client/dist/thumbor-client.js'

  const url = createThumbor({ url: 'https://thumbor.example.com' })
    .fromUrl('https://cataas.com/cat')
    .resize(300, 200)
    .buildURL()
</script>
```

Classic script, exposes the `ThumborClient` global:

```html
<script src="https://cdn.jsdelivr.net/npm/thumbor-client/dist/thumbor-client.iife.js"></script>
<script>
  const url = ThumborClient.createThumbor({ url: 'https://thumbor.example.com' })
    .fromUrl('https://cataas.com/cat')
    .resize(300, 200)
    .buildURL()
</script>
```

Pin a version in production: `thumbor-client@0.1.1`.

## Development

Uses [Bun](https://bun.sh) locally. The published package does not depend on Bun.

```sh
bun install
bun run test         # unit tests (vitest)
bun run typecheck
bun run build        # dist/: esm, cjs, iife, d.ts
bun run test:smoke   # runs the built package in node (esm, cjs, iife)
```

CI also runs the smoke tests in Bun and Deno.

## License

MIT
