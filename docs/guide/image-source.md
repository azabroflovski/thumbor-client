# Image source

## Url

```ts
thumbor.fromUrl('https://example.com/cat.jpg')
```

The url goes into the Thumbor url as is. If it has a query string, encode it, otherwise `?` and `&` end up in the Thumbor url itself:

```ts
thumbor.fromUrl('https://example.com/cat.jpg?size=large', { encode: true }).resize(300, 200).buildURL()
// https://thumbor.example.com/unsafe/300x200/https%3A%2F%2Fexample.com%2Fcat.jpg%3Fsize%3Dlarge
```

Thumbor decodes it before loading the image.

## Path

For images stored next to Thumbor, for example with the file loader or an S3 loader:

```ts
thumbor.setPath('/photos/cat.jpg').buildURL()
// https://thumbor.example.com/unsafe/photos/cat.jpg
```

A leading `/` is removed.
