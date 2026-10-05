# thumbor-client

URL builder for [Thumbor](https://www.thumbor.org/). TypeScript, no dependencies, about 3 KB gzipped.

Works in Node, Bun, Deno, Cloudflare Workers and browsers. Urls are built synchronously everywhere, signing included.

```sh
npm i thumbor-client
```

```ts
import { createThumbor } from 'thumbor-client'

const thumbor = createThumbor({
  url: 'https://thumbor.example.com',
  key: 'secret'
})

thumbor.image('https://example.com/cat.jpg').resize(300, 200).smart().url()
// https://thumbor.example.com/gFMdxP8CRDmNv4bUKISOyjubGds=/300x200/smart/https://example.com/cat.jpg
```

- [Getting started](/guide/getting-started)
- [API reference](/api)
- [Migrating from buildURL()](/guide/migration), if you use the API from 0.3 and earlier
- [Playground](/playground/){target="_self"}: build a url in the browser and see the result from your Thumbor server
