# Security key

With `SECURITY_KEY` set and `ALLOW_UNSAFE_URL = False`, Thumbor only serves urls signed with that key. Anyone who has the key can generate any url, including huge sizes that load your server.

## Keep the key on the server

Sign urls where the key is stored, send ready urls to the client:

```ts
// server
const thumbor = createThumbor({ url: process.env.THUMBOR_URL, key: process.env.THUMBOR_KEY })

export function avatarUrl(src: string) {
  return thumbor.fromUrl(src).resize(64, 64).smartCrop().buildURL()
}
```

With SSR this is the default: urls are built during rendering on the server and only the result reaches the browser. Make sure the client bundle does not include the module that reads the key.

## When the key is in the browser

If you pass `key` in browser code, it is in your JavaScript bundle and can be read by anyone. Do it only for internal tools, or use a separate Thumbor instance with unsafe urls for public pages.
