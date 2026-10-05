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
thumbor.fromUrl('https://example.com/cat.jpg').resize(300, 200).smartCrop().buildURL()
// https://thumbor.example.com/gFMdxP8CRDmNv4bUKISOyjubGds=/300x200/smart/https://example.com/cat.jpg
```

Without `key` they are unsafe. Thumbor accepts them only with `ALLOW_UNSAFE_URL = True`:

```
https://thumbor.example.com/unsafe/300x200/smart/https://example.com/cat.jpg
```

## Build urls

Chain operations and finish with `buildURL()`. The order of calls does not matter, the url segments always come out in the order Thumbor expects.

`buildURL()` resets the builder, so one client is enough for the whole app:

```ts
const avatar = thumbor.fromUrl(user.photo).resize(64, 64).smartCrop().buildURL()
const cover = thumbor.fromUrl(post.cover).fitIn(1200, 630).buildURL()
```

## Run Thumbor locally

```sh
docker run -p 8888:8888 thumbororg/thumbor:7-py-3.12 -i 0.0.0.0
```

Unsafe urls are allowed by default. For signed urls and other options pass a config file, see the [compose.yaml](https://github.com/azabroflovski/thumbor-client/blob/master/compose.yaml) in this repo.
