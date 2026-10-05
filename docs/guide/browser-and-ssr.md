# Browser and SSR

The package has no dependencies and uses no Node or browser APIs. Signing is a built-in synchronous HMAC-SHA1, so `buildURL()` returns a string right away everywhere: Node, Bun, Deno, Cloudflare Workers, browsers. It can be called during server rendering, in templates and in render functions.

## Bundlers

```ts
import { createThumbor } from 'thumbor-client'
```

ESM and CommonJS builds with types for both.

## Without a bundler

ES module:

```html
<script type="module">
  import { createThumbor } from 'https://cdn.jsdelivr.net/npm/thumbor-client@0.2/dist/thumbor-client.js'
</script>
```

Classic script, exposes the `ThumborClient` global:

```html
<script src="https://cdn.jsdelivr.net/npm/thumbor-client@0.2/dist/thumbor-client.iife.js"></script>
<script>
  const thumbor = ThumborClient.createThumbor({ url: 'https://thumbor.example.com' })
</script>
```

Pin at least the minor version in production.

## Signing in the browser

Works, but the key becomes public. See [Security key](/guide/security-key).
