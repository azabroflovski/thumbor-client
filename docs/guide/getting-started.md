# Getting started

## Install

::: code-group

```sh [npm]
npm i thumbor-client
```

```sh [bun]
bun add thumbor-client
```

```sh [pnpm]
pnpm add thumbor-client
```

```sh [deno]
deno add npm:thumbor-client
```

:::

## Create a client

```ts
import { createThumbor } from 'thumbor-client'

const thumbor = createThumbor({
  url: 'https://thumbor.example.com',
  key: process.env.THUMBOR_KEY
})
```

`url` is the address of your Thumbor server. `key` is `SECURITY_KEY` from `thumbor.conf`.

With `key` urls are signed:

```ts
thumbor.image('https://example.com/cat.jpg').resize(300, 200).smart().url()
// https://thumbor.example.com/gFMdxP8CRDmNv4bUKISOyjubGds=/300x200/smart/https://example.com/cat.jpg
```

Without `key` they are unsafe. Thumbor accepts them only with `ALLOW_UNSAFE_URL = True`:

```
https://thumbor.example.com/unsafe/300x200/smart/https://example.com/cat.jpg
```

## Build urls

`thumbor.image(src)` starts an image. Chain operations, then call `url()`. The order of calls does not matter, segments always come out in the order Thumbor expects.

Every call returns a new object and leaves the previous one unchanged. A partly built image works as a preset:

```ts
const avatar = (src: string) => thumbor.image(src).resize(64, 64).smart()

avatar('https://example.com/u1.jpg').url()
// https://thumbor.example.com/unsafe/64x64/smart/https://example.com/u1.jpg

avatar('https://example.com/u1.jpg').format('webp').url()
// https://thumbor.example.com/unsafe/64x64/smart/filters:format(webp)/https://example.com/u1.jpg
```

## Image as a string

`String(image)`, template strings and `JSON.stringify` all give the url, so an image can go straight into a template or into props serialized during SSR:

```ts
const cover = thumbor.image(post.cover).fitIn(1200, 630)

`<img src="${cover}">`
JSON.stringify({ cover }) // {"cover":"https://thumbor.example.com/unsafe/fit-in/1200x630/..."}
```

Call `url()` where a real `string` type is required.

## srcset

```ts
thumbor.image('cat.jpg').fitIn(800, 600).srcset([400, 800, 1200])
// https://thumbor.example.com/unsafe/fit-in/400x300/cat.jpg 400w,
// https://thumbor.example.com/unsafe/fit-in/800x600/cat.jpg 800w,
// https://thumbor.example.com/unsafe/fit-in/1200x900/cat.jpg 1200w
```

The height scales with the width. Without a size, each entry is `resize(width, 0)`.

## Run Thumbor locally

```sh
docker run -p 8888:8888 thumbororg/thumbor:7-py-3.12 -i 0.0.0.0
```

Unsafe urls are allowed by default. For signed urls and other options pass a config file, see [compose.yaml](https://github.com/azabroflovski/thumbor-client/blob/master/compose.yaml) in the repo.
