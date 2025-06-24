# thumbor-client

A simple and efficient [Thumbor](https://www.thumbor.org/) client for TypeScript/JavaScript (works on node and browser).

## Installation

```
# via npm
$ npm i thumbor-client

# via yarn
$ yarn add thumbor-client

# via bun
$ bun add thumbor-client
```

## Simple usage

```typescript
import { createThumbor } from 'thumbor-client'

const thumbor = createThumbor({
    url: 'https://your-thumbor.com',
    key: 'secret'
})

const imgUrl = thumbor
    .fromUrl('https://cataas.com/cat')
    .smartCrop(true)
    .resize(300, 200)
    .buildURL()

console.log(imageUrl) 
// https://your-thumbor.com/unsafe/300x200/smart/https://cataas.com/cat
```

## Using from CDN

You can use `thumbor-client` from a CDN via a script tag:

```html
<script src="https://unpkg.com/thumbor-client/dist/thumbor-client.js"></script>
```

Here we are using `unpkg`, but you can also use any CDN that serves npm packages, for example `jsdelivr` or `cdnjs`.
Of course, you can also download this file and serve it yourself.

When using `thumbor-client` from a CDN, there is no "build step" (bundler) involved. This makes the setup a lot simpler,
and is suitable for enhancing static HTML or integrating with a backend framework. However, you won't be able to use frameworks.

## Using the ES Module Build

Throughout the rest of the documentation, we will be primarily using ES modules syntax.
Most modern browsers now support ES modules natively, so we can use `thumbor-client` from a CDN via native ES modules like this:

```html
<script type="module">
  import { createThumbor } from 'https://unpkg.com/thumbor-client/dist/thumbor-client.js'

  const thumbor = createThumbor({
      url: 'https://your-thumbor.com',
      key: 'secret'
  })

  const imgUrl = thumbor
      .fromUrl('https://cataas.com/cat')
      .smartCrop(true)
      .resize(300, 200)
      .buildURL()

  console.log(imageUrl)
  // https://your-thumbor.com/unsafe/300x200/smart/https://cataas.com/cat
</script>
```

### Enabling Import maps

In the above example, we are importing from the full CDN URL, but in the rest of the documentation you will see code like this:

```js
import { createThumbor } from 'thumbor-client'
```

We can teach the browser where to locate the `thumbor-client` import by using Import Maps:

```html
<script type="importmap">
  {
    "imports": {
      "thumbor-client": "https://unpkg.com/thumbor-client/dist/thumbor-client.js"
    }
  }
</script>

<script type="module">
    import { createThumbor } from 'thumbor-client'

    const thumbor = createThumbor({
        url: 'https://your-thumbor.com',
        key: 'secret'
    })

    const imgUrl = thumbor
            .fromUrl('https://cataas.com/cat')
            .smartCrop(true)
            .resize(300, 200)
            .buildURL()

    console.log(imageUrl)
    // https://your-thumbor.com/unsafe/300x200/smart/https://cataas.com/cat
</script>
```

## LICENSE

MIT

## Copyright

&copy; 2023 azabroflovski
