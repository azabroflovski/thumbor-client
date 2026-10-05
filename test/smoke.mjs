// Checks the built package through its "exports" map. Run with node, bun and deno.
import { createThumbor, FitInType, HorizontalPosition } from 'thumbor-client'

const expected = 'https://t.example/vQ9gieafFixUca_XvzCDWc1tp_I=/adaptive-fit-in/300x200/left/a.jpg'
const url = createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
  .setPath('a.jpg')
  .fitIn(300, 200, FitInType.ADAPTIVE)
  .halign(HorizontalPosition.LEFT)
  .buildURL()

if (url !== expected) {
  console.error(`esm: got ${url}`)
  process.exit(1)
}
const image = createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
  .image('a.jpg')
  .fitIn(300, 200, { adaptive: true })
  .align('left')
if (image.url() !== expected || `${image}` !== expected) {
  console.error(`esm image api: got ${image.url()}`)
  process.exit(1)
}
console.log('esm ok')
