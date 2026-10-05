// Requests urls from a running Thumbor server: `bun run thumbor && bun run build && bun run test:live`.
// Defaults match compose.yaml and thumbor.conf. Override with THUMBOR_URL and THUMBOR_KEY.
import { createThumbor, filters as f, FitInType, HorizontalPosition, VerticalPosition } from 'thumbor-client'

const server = process.env.THUMBOR_URL ?? 'http://localhost:8888'
const key = process.env.THUMBOR_KEY ?? 'MY_SECURE_KEY'
const image = 'https://raw.githubusercontent.com/thumbor/thumbor/master/example.jpg'
const logo = 'https://raw.githubusercontent.com/thumbor/thumbor/master/docs/images/logo-thumbor.png'

let failed = 0
function report(ok, label, url) {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}  ${url}`)
}

async function get(url) {
  const res = await fetch(url)
  return { res, body: Buffer.from(await res.arrayBuffer()) }
}

// 1. every url option, signed and unsafe: Thumbor must return an image (or json for meta)

const cases = {
  'no operations': (t) => t.fromUrl(image),
  'resize + smart': (t) => t.fromUrl(image).resize(300, 200).smartCrop(),
  'orig + flip': (t) => t.fromUrl(image).resize('orig', 100).flipHorizontally().flipVertically(),
  ...Object.fromEntries(Object.values(FitInType).map((type) => [`fit-in ${type}`, (t) => t.fromUrl(image).fitIn(300, 200, type)])),
  'align': (t) => t.fromUrl(image).resize(300, 200).halign(HorizontalPosition.RIGHT).valign(VerticalPosition.BOTTOM),
  'trim': (t) => t.fromUrl(image).trim(),
  'trim:bottom-right:10': (t) => t.fromUrl(image).trim('bottom-right', 10),
  'debug': (t) => t.fromUrl(image).resize(300, 200).smartCrop().debug(),
  'meta': (t) => t.fromUrl(image).resize(300, 200).meta(),
  'encoded url with query': (t) => t.fromUrl(image + '?v=1&x=2', { encode: true }).resize(300, 200),
  'everything': (t) => t.fromUrl(image)
    .debug()
    .trim('top-left', 5)
    .crop({ left: 10, top: 10, right: 500, bottom: 400 })
    .fitIn(300, 200, FitInType.FULL)
    .flipHorizontally()
    .halign(HorizontalPosition.LEFT)
    .valign(VerticalPosition.TOP)
    .smartCrop()
    .filter(f.quality(80), f.format('webp'))
}

for (const signed of [false, true]) {
  const thumbor = createThumbor({ url: server, key: signed ? key : undefined })
  for (const [name, build] of Object.entries(cases)) {
    const url = build(thumbor).buildURL()
    const { res } = await get(url)
    const type = res.headers.get('content-type') ?? ''
    const expected = name === 'meta' ? 'application/json' : 'image/'
    report(res.ok && type.startsWith(expected), `${res.status} ${signed ? 'signed' : 'unsafe'} ${name}`, url)
  }
}

// 2. every filter helper: the result must differ from the same url without the filter.
// Thumbor ignores filters with bad arguments and still returns 200, so status alone proves nothing.

const thumbor = createThumbor({ url: server })
const base = () => thumbor.fromUrl(image).fitIn(300, 200)
const baseBody = (await get(base().buildURL())).body

const filterCases = {
  quality: f.quality(10),
  blur: f.blur(5),
  'blur with sigma': f.blur(5, 2),
  brightness: f.brightness(40),
  contrast: f.contrast(40),
  saturation: f.saturation(0.2),
  rgb: f.rgb(30, -20, 0),
  grayscale: f.grayscale(),
  equalize: f.equalize(),
  noise: f.noise(40),
  sharpen: f.sharpen(2, 1, true),
  rotate: f.rotate(90),
  fill: f.fill('ff0000'),
  roundCorner: f.roundCorner(40),
  'roundCorner elliptic, color': f.roundCorner([40, 20], [0, 0, 0]),
  colorize: f.colorize(100, 0, 0, 'ff0000'),
  convolution: f.convolution([-1, -1, -1, -1, 8, -1, -1, -1, -1], 3),
  watermark: f.watermark(logo, 10, 10, 0),
  'watermark ratio': f.watermark(logo, 'center', 'center', 0, 50),
  proportion: f.proportion(0.5),
  maxBytes: f.maxBytes(8000)
}

for (const [name, filter] of Object.entries(filterCases)) {
  const url = base().filter(filter).buildURL()
  const { res, body } = await get(url)
  report(res.ok && !body.equals(baseBody), `filter ${name}`, url)
}

// stretch works with resize, not with fit-in
{
  const url = thumbor.fromUrl(image).resize(300, 300).filter(f.stretch()).buildURL()
  const plain = (await get(thumbor.fromUrl(image).resize(300, 300).buildURL())).body
  const { res, body } = await get(url)
  report(res.ok && !body.equals(plain), 'filter stretch', url)
}

// fill only shows on the padding of fit-in
{
  const url = thumbor.fromUrl(image).fitIn(300, 300).filter(f.fill('ff0000')).buildURL()
  const plain = (await get(thumbor.fromUrl(image).fitIn(300, 300).buildURL())).body
  const { res, body } = await get(url)
  report(res.ok && !body.equals(plain), 'filter fill on padding', url)
}

for (const format of ['webp', 'avif', 'png', 'gif', 'jpeg']) {
  const url = base().filter(f.format(format)).buildURL()
  const { res } = await get(url)
  report(res.ok && res.headers.get('content-type') === `image/${format}`, `filter format ${format}`, url)
}

{
  const url = base().filter(f.maxAge(60)).buildURL()
  const { res } = await get(url)
  report(res.ok && /max-age=60\b/.test(res.headers.get('cache-control') ?? ''), 'filter maxAge', url)
}

// filters that only change output in specific cases: check that Thumbor accepts them
for (const [name, filter] of Object.entries({
  backgroundColor: f.backgroundColor('ffffff'),
  focal: f.focal({ left: 100, top: 100, right: 200, bottom: 200 }),
  extractFocal: f.extractFocal(),
  noUpscale: f.noUpscale(),
  upscale: f.upscale(),
  stripExif: f.stripExif(),
  stripIcc: f.stripIcc(),
  frame: f.frame(logo)
})) {
  const url = base().filter(filter).buildURL()
  const { res } = await get(url)
  report(res.ok && (res.headers.get('content-type') ?? '').startsWith('image/'), `filter ${name} (accepted)`, url)
}

process.exit(failed ? 1 : 0)
