# Browser and SSR

The package has no dependencies and uses no Node or browser APIs. Signing is a built-in synchronous HMAC-SHA1, so `url()` returns a string right away everywhere: Node, Bun, Deno, Cloudflare Workers, browsers. It can be called during server rendering, in templates and in render functions.

## In components

```tsx
// React
const photo = thumbor.image(src).fitIn(800, 600)

<img src={photo.url()} srcSet={photo.srcset([400, 800, 1200])} sizes="(max-width: 800px) 100vw, 800px" />
```

```vue
<!-- Vue -->
<img :src="photo.url()" :srcset="photo.srcset([400, 800, 1200])" />
```

Images are plain objects without state shared between them, so building them in render functions is safe.

## Bundlers

```ts
import { createThumbor } from 'thumbor-client'
```

ESM and CommonJS builds with types for both.

## Without a bundler

ES module:

```html
<script type="module">
  import { createThumbor } from 'https://cdn.jsdelivr.net/npm/thumbor-client@0.4/dist/thumbor-client.js'
</script>
```

Classic script, exposes the `ThumborClient` global:

```html
<script src="https://cdn.jsdelivr.net/npm/thumbor-client@0.4/dist/thumbor-client.iife.js"></script>
<script>
  const thumbor = ThumborClient.createThumbor({ url: 'https://thumbor.example.com' })
  document.querySelector('img').src = thumbor.image('https://example.com/cat.jpg').resize(300, 200).url()
</script>
```

Pin at least the minor version in production.

## Signing in the browser

Works, but the key becomes public. See [Security key](/guide/security-key).
