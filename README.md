# thumbor-client

URL builder for [Thumbor](https://www.thumbor.org/). TypeScript, no dependencies, ~3 KB gzipped.

Docs: https://thumbor-js.broflovski.dev · Playground: https://thumbor-js.broflovski.dev/playground/

Works in Node, Bun, Deno, Cloudflare Workers and browsers. Urls are built synchronously everywhere, signing included, so it works during SSR and in templates.

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

thumbor.image('https://example.com/cat.jpg').resize(300, 200).smart().url()
// https://thumbor.example.com/gFMdxP8CRDmNv4bUKISOyjubGds=/300x200/smart/https://example.com/cat.jpg
```

Without `key` the url is unsafe:

```
https://thumbor.example.com/unsafe/300x200/smart/https://example.com/cat.jpg
```

Every call returns a new object, so a partly built image works as a preset:

```ts
const avatar = (src: string) => thumbor.image(src).resize(64, 64).smart()

avatar(user.photo).url()
avatar(user.photo).format('webp').url()
```

### Fit-in, filters

```ts
thumbor.image('/photos/cat.jpg').fitIn(800, 600, { full: true }).quality(80).format('webp').url()
// https://thumbor.example.com/unsafe/full-fit-in/800x600/filters:quality(80):format(webp)/photos/cat.jpg
```

### Crop and alignment

```ts
thumbor.image('/photos/cat.jpg').crop({ left: 10, top: 20, right: 410, bottom: 320 }).resize(200, 150).align('left', 'top').url()
// https://thumbor.example.com/unsafe/10x20:410x320/200x150/left/top/photos/cat.jpg
```

### srcset

```ts
thumbor.image('cat.jpg').fitIn(800, 600).srcset([400, 800, 1200])
// .../fit-in/400x300/cat.jpg 400w, .../fit-in/800x600/cat.jpg 800w, .../fit-in/1200x900/cat.jpg 1200w
```

## API

`thumbor.image(src, { encode? })` returns an immutable image:

| Method | Thumbor segment |
|---|---|
| `resize(width, height)` | `300x200`; `0` keeps proportions, `'orig'` keeps the original size |
| `fitIn(width, height, { full?, adaptive? })` | `fit-in`, `full-fit-in`, `adaptive-fit-in`, `adaptive-full-fit-in` |
| `flip('horizontal' \| 'vertical' \| 'both')` | `-300x-200` |
| `crop({ left, top, right, bottom })` | `10x20:410x320` |
| `align(horizontal?, vertical?)` | `left/top` |
| `smart()` | `smart` |
| `trim(orientation?, tolerance?)` | `trim`, `trim:bottom-right:10` |
| `meta()` | `meta`, JSON instead of the image |
| `debug()` | `debug`, draws focal points |
| `quality(80)`, `format('webp')`, `blur(5)`, ... | one method per Thumbor filter, see [Filters](https://thumbor-js.broflovski.dev/guide/filters) |
| `filter(...calls)` | any filter as a string |
| `url()`, `toString()`, `toJSON()` | the url |
| `srcset(widths)` | `url 400w, url 800w` |

The API from 0.3 and earlier (`fromUrl`, `setPath`, ..., `buildURL()`) still works and is deprecated. See [Migrating](https://thumbor-js.broflovski.dev/guide/migration).

## Security key in the browser

The library can sign urls in the browser, but any key shipped to the browser is public. Sign on the server and pass ready urls to the client, or use unsafe urls with a Thumbor instance that allows them.

## Browser without a bundler

ES module:

```html
<script type="module">
  import { createThumbor } from 'https://cdn.jsdelivr.net/npm/thumbor-client/dist/thumbor-client.js'

  const url = createThumbor({ url: 'https://thumbor.example.com' })
    .image('https://example.com/cat.jpg')
    .resize(300, 200)
    .url()
</script>
```

Classic script, exposes the `ThumborClient` global:

```html
<script src="https://cdn.jsdelivr.net/npm/thumbor-client/dist/thumbor-client.iife.js"></script>
<script>
  const url = ThumborClient.createThumbor({ url: 'https://thumbor.example.com' })
    .image('https://example.com/cat.jpg')
    .resize(300, 200)
    .url()
</script>
```

Pin at least the minor version in production: `thumbor-client@0.4`.

## Development

Uses [Bun](https://bun.sh) locally. The published package does not depend on Bun.

```sh
bun install
bun run test         # unit tests (vitest)
bun run typecheck
bun run build        # dist/: esm, cjs, iife, d.ts
bun run test:smoke   # runs the built package in node (esm, cjs, iife)
bun run dev          # playground
bun run docs:dev     # docs site
bun run thumbor      # local thumbor on :8888, see compose.yaml
bun run test:live    # requests every url type from the local thumbor
```

CI also runs the smoke tests in Bun and Deno, and `test:live` against Thumbor 7.

## License

MIT
