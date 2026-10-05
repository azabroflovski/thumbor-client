// Requests urls from a running Thumbor server: `bun run thumbor && bun run build && bun run test:live`.
// Defaults match compose.yaml and thumbor.conf. Override with THUMBOR_URL and THUMBOR_KEY.
import { createThumbor, FitInType, HorizontalPosition, VerticalPosition } from 'thumbor-client'

const server = process.env.THUMBOR_URL ?? 'http://localhost:8888'
const key = process.env.THUMBOR_KEY ?? 'MY_SECURE_KEY'
const image = 'https://raw.githubusercontent.com/thumbor/thumbor/master/example.jpg'

const cases = {
  'no operations': (t) => t.fromUrl(image),
  'resize + smart': (t) => t.fromUrl(image).resize(300, 200).smartCrop(),
  'orig + flip': (t) => t.fromUrl(image).resize('orig', 100).flipHorizontally().flipVertically(),
  ...Object.fromEntries(Object.values(FitInType).map((type) => [`fit-in ${type}`, (t) => t.fromUrl(image).fitIn(300, 200, type)])),
  'align': (t) => t.fromUrl(image).resize(300, 200).halign(HorizontalPosition.RIGHT).valign(VerticalPosition.BOTTOM),
  'everything': (t) => t.fromUrl(image)
    .trim()
    .crop({ left: 10, top: 10, right: 500, bottom: 400 })
    .fitIn(300, 200, FitInType.FULL)
    .flipHorizontally()
    .halign(HorizontalPosition.LEFT)
    .valign(VerticalPosition.TOP)
    .smartCrop()
    .filter('quality(80)')
    .filter('format(webp)')
}

let failed = 0
for (const signed of [false, true]) {
  const thumbor = createThumbor({ url: server, key: signed ? key : undefined })
  for (const [name, build] of Object.entries(cases)) {
    const url = build(thumbor).buildURL()
    const res = await fetch(url)
    const ok = res.ok && res.headers.get('content-type')?.startsWith('image/')
    if (!ok) failed++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${res.status} ${signed ? 'signed' : 'unsafe'} ${name}  ${url}`)
  }
}
process.exit(failed ? 1 : 0)
