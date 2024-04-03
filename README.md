# thumbor-client

A simple and efficient Thumbor client for TypeScript/JavaScript (works on node and browser).

Package designed to simplify working with Thumbor. 
It allows you to easily make requests to the Thumbor API, generate image URLs 
with various transformation parameters, and get information about the Thumbor server status.

## Features

- Simple interface: Thumbor-TS provides a simple and intuitive interface for working with the Thumbor API. You don't need to know the details of the API to use Thumbor-TS.
- Image URL generation: Thumbor-TS allows you to easily generate image URLs with various transformation parameters, such as size, scaling, cropping, filters, and more.
- Status information retrieval: Thumbor-TS allows you to get information about the Thumbor server status, such as uptime, number of processed requests, and more.
- TypeScript support: Thumbor-TS is written in TypeScript, which ensures reliability, typing, and ease of use.
- Easy installation: Thumbor-TS can be easily installed using npm.

## Installation

via npm

```
$ npm i thumbor-client
```

### Simple usage

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

console.log(imageUrl) // https://your-thumbor.com/unsafe/300x200/smart/https://cataas.com/cat
```

## LICENSE

MIT

## Copyright
&copy; 2024 azabroflovski
