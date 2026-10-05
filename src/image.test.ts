import { describe, expect, test } from 'vitest'
import { createThumbor, filters, FitInType, HorizontalPosition, VerticalPosition, type Thumbor, type ThumborImage } from './main.ts'

const server = 'https://thumbor.example.com'

// the same operations through the old mutable builder and the new image api
const pairs: Array<[string, (t: Thumbor) => string, (t: Thumbor) => ThumborImage]> = [
  ['url source', (t) => t.fromUrl('https://example.com/cat.jpg').buildURL(), (t) => t.image('https://example.com/cat.jpg')],
  ['path source', (t) => t.setPath('/photos/cat.jpg').buildURL(), (t) => t.image('/photos/cat.jpg')],
  ['encoded source', (t) => t.fromUrl('https://example.com/a.jpg?x=1', { encode: true }).buildURL(), (t) => t.image('https://example.com/a.jpg?x=1', { encode: true })],
  ['resize', (t) => t.setPath('a.jpg').resize(300, 200).buildURL(), (t) => t.image('a.jpg').resize(300, 200)],
  ['orig', (t) => t.setPath('a.jpg').resize('orig', 100).buildURL(), (t) => t.image('a.jpg').resize('orig', 100)],
  ['fit-in', (t) => t.setPath('a.jpg').fitIn(800, 600).buildURL(), (t) => t.image('a.jpg').fitIn(800, 600)],
  ['full-fit-in', (t) => t.setPath('a.jpg').fitIn(800, 600, FitInType.FULL).buildURL(), (t) => t.image('a.jpg').fitIn(800, 600, { full: true })],
  ['adaptive-fit-in', (t) => t.setPath('a.jpg').fitIn(800, 600, FitInType.ADAPTIVE).buildURL(), (t) => t.image('a.jpg').fitIn(800, 600, { adaptive: true })],
  ['adaptive-full-fit-in', (t) => t.setPath('a.jpg').fitIn(800, 600, FitInType.ADAPTIVE_FULL).buildURL(), (t) => t.image('a.jpg').fitIn(800, 600, { adaptive: true, full: true })],
  ['fit-in enum', (t) => t.setPath('a.jpg').fitIn(800, 600, FitInType.FULL).buildURL(), (t) => t.image('a.jpg').fitIn(800, 600, FitInType.FULL)],
  ['flip h', (t) => t.setPath('a.jpg').resize(300, 200).flipHorizontally().buildURL(), (t) => t.image('a.jpg').resize(300, 200).flip('horizontal')],
  ['flip v', (t) => t.setPath('a.jpg').resize(300, 200).flipVertically().buildURL(), (t) => t.image('a.jpg').resize(300, 200).flip('vertical')],
  ['flip both', (t) => t.setPath('a.jpg').resize(300, 200).flipHorizontally().flipVertically().buildURL(), (t) => t.image('a.jpg').resize(300, 200).flip('both')],
  ['crop', (t) => t.setPath('a.jpg').crop({ left: 1, top: 2, right: 3, bottom: 4 }).buildURL(), (t) => t.image('a.jpg').crop({ left: 1, top: 2, right: 3, bottom: 4 })],
  ['align', (t) => t.setPath('a.jpg').resize(300, 300).halign(HorizontalPosition.RIGHT).valign(VerticalPosition.BOTTOM).buildURL(), (t) => t.image('a.jpg').resize(300, 300).align('right', 'bottom')],
  ['valign only', (t) => t.setPath('a.jpg').valign(VerticalPosition.TOP).buildURL(), (t) => t.image('a.jpg').align(undefined, 'top')],
  ['smart', (t) => t.setPath('a.jpg').resize(300, 300).smartCrop().buildURL(), (t) => t.image('a.jpg').resize(300, 300).smart()],
  ['trim', (t) => t.setPath('a.jpg').trim('bottom-right', 10).buildURL(), (t) => t.image('a.jpg').trim('bottom-right', 10)],
  ['meta debug', (t) => t.setPath('a.jpg').meta().debug().buildURL(), (t) => t.image('a.jpg').meta().debug()],
  ['filters', (t) => t.setPath('a.jpg').filter(filters.quality(80), 'format(webp)').buildURL(), (t) => t.image('a.jpg').quality(80).filter('format(webp)')],
  ['everything', (t) => t.fromUrl('https://example.com/cat.jpg')
    .debug().meta().trim('top-left', 5).crop({ left: 10, top: 10, right: 500, bottom: 400 })
    .fitIn(300, 200, FitInType.FULL).flipHorizontally().halign(HorizontalPosition.LEFT).valign(VerticalPosition.TOP)
    .smartCrop().filter(filters.quality(80), filters.format('webp')).buildURL(),
  (t) => t.image('https://example.com/cat.jpg')
    .quality(80).format('webp').smart().align('left', 'top').flip('horizontal').fitIn(300, 200, { full: true })
    .crop({ left: 10, top: 10, right: 500, bottom: 400 }).trim('top-left', 5).meta().debug()
    .filter() // no-op
  ]
]

describe.each([
  ['unsafe', undefined],
  ['signed', 'MY_SECURE_KEY']
])('old and new api give the same url (%s)', (_, key) => {
  test.each(pairs)('%s', (_, old, next) => {
    const thumbor = createThumbor({ url: server, key })
    expect(next(thumbor).url()).toBe(old(thumbor))
  })
})

describe('image api', () => {
  const thumbor = createThumbor({ url: server })

  test('immutable', () => {
    const base = thumbor.image('a.jpg').resize(300, 200)
    const webp = base.format('webp')
    const smart = base.smart()
    expect(base.url()).toBe(`${server}/unsafe/300x200/a.jpg`)
    expect(webp.url()).toBe(`${server}/unsafe/300x200/filters:format(webp)/a.jpg`)
    expect(smart.url()).toBe(`${server}/unsafe/300x200/smart/a.jpg`)
  })

  test('crop rect is copied', () => {
    const rect = { left: 1, top: 2, right: 3, bottom: 4 }
    const image = thumbor.image('a.jpg').crop(rect)
    rect.left = 100
    expect(image.url()).toBe(`${server}/unsafe/1x2:3x4/a.jpg`)
  })

  test('does not touch the old builder state', () => {
    thumbor.setPath('old.jpg').resize(10, 10)
    expect(thumbor.image('new.jpg').url()).toBe(`${server}/unsafe/new.jpg`)
    expect(thumbor.buildURL()).toBe(`${server}/unsafe/10x10/old.jpg`)
  })

  test('string conversion', () => {
    const image = thumbor.image('a.jpg').resize(300, 200)
    const url = `${server}/unsafe/300x200/a.jpg`
    expect(String(image)).toBe(url)
    expect(`${image}`).toBe(url)
    expect(JSON.stringify({ image })).toBe(JSON.stringify({ image: url }))
  })

  test('resize and fitIn replace each other', () => {
    expect(thumbor.image('a.jpg').fitIn(800, 600).resize(300, 200).url()).toBe(`${server}/unsafe/300x200/a.jpg`)
    expect(thumbor.image('a.jpg').resize(300, 200).fitIn(800, 600).url()).toBe(`${server}/unsafe/fit-in/800x600/a.jpg`)
  })

  test('srcset keeps proportions and the fit mode', () => {
    expect(thumbor.image('a.jpg').fitIn(800, 600, { full: true }).srcset([400, 1200])).toBe(
      `${server}/unsafe/full-fit-in/400x300/a.jpg 400w, ${server}/unsafe/full-fit-in/1200x900/a.jpg 1200w`
    )
    expect(thumbor.image('a.jpg').resize(800, 0).smart().srcset([400])).toBe(`${server}/unsafe/400x0/smart/a.jpg 400w`)
    expect(thumbor.image('a.jpg').srcset([320, 640])).toBe(`${server}/unsafe/320x0/a.jpg 320w, ${server}/unsafe/640x0/a.jpg 640w`)
  })
})

describe('filter methods', () => {
  const thumbor = createThumbor({ url: server })

  // sample arguments for every helper; the test fails when a helper is added without a sample
  const samples: { [K in keyof typeof filters]: Parameters<(typeof filters)[K]> } = {
    quality: [80], format: ['webp'], blur: [5, 2], brightness: [10], contrast: [10], saturation: [1.5],
    rgb: [1, 2, 3], grayscale: [], equalize: [], noise: [10, 1], sharpen: [2, 1, true], rotate: [90],
    fill: ['white', true], backgroundColor: ['fff'], roundCorner: [[10, 5], [0, 0, 0], true],
    colorize: [1, 2, 3, 'f00'], convolution: [[1, 2, 1], 3, false], focal: [{ left: 1, top: 2, right: 3, bottom: 4 }],
    extractFocal: [], noUpscale: [], upscale: [], stretch: [], proportion: [0.5], stripExif: [], stripIcc: [],
    maxBytes: [1000], maxAge: [60], watermark: ['w.png', 'center', '10p', 50, 20, 30], frame: ['f.png']
  }

  test.each(Object.keys(samples) as Array<keyof typeof filters>)('%s', (name) => {
    const args = samples[name] as unknown[]
    const image = thumbor.image('a.jpg') as unknown as Record<string, (...a: unknown[]) => ThumborImage>
    const expected = thumbor.image('a.jpg').filter((filters[name] as (...a: unknown[]) => string)(...args)).url()
    expect(image[name](...args).url()).toBe(expected)
  })

  test('every helper has a method', () => {
    expect(Object.keys(samples).sort()).toEqual(Object.keys(filters).sort())
  })
})
