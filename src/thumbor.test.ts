import { createHmac } from 'node:crypto'
import { describe, expect, test } from 'vitest'
import { createThumbor, FitInType, HorizontalPosition, VerticalPosition } from './main.ts'
import { sign } from './lib/sign.ts'

const server = 'https://thumbor.example.com'

function nodeSign(key: string, path: string) {
  return createHmac('sha1', key).update(path).digest('base64').replace(/\+/g, '-').replace(/\//g, '_')
}

describe('unsafe urls', () => {
  const thumbor = createThumbor({ url: server })

  test('image only', () => {
    expect(thumbor.setPath('/cat.jpg').buildURL()).toBe(`${server}/unsafe/cat.jpg`)
  })

  test('trailing slash in server url', () => {
    expect(createThumbor({ url: server + '/' }).setPath('cat.jpg').buildURL()).toBe(`${server}/unsafe/cat.jpg`)
  })

  test('resize and smart crop', () => {
    expect(thumbor.fromUrl('https://cataas.com/cat').resize(300, 200).smartCrop().buildURL())
      .toBe(`${server}/unsafe/300x200/smart/https://cataas.com/cat`)
  })

  test('orig size', () => {
    expect(thumbor.setPath('a.jpg').resize('orig', 100).buildURL()).toBe(`${server}/unsafe/origx100/a.jpg`)
  })

  test('flip', () => {
    expect(thumbor.setPath('a.jpg').resize(300, 200).flipHorizontally().flipVertically().buildURL())
      .toBe(`${server}/unsafe/-300x-200/a.jpg`)
    expect(thumbor.setPath('a.jpg').flipHorizontally().buildURL()).toBe(`${server}/unsafe/-0x0/a.jpg`)
  })

  test.each([
    [FitInType.DEFAULT, 'fit-in'],
    [FitInType.FULL, 'full-fit-in'],
    [FitInType.ADAPTIVE, 'adaptive-fit-in'],
    [FitInType.ADAPTIVE_FULL, 'adaptive-full-fit-in']
  ])('fit-in %s', (type, segment) => {
    expect(thumbor.setPath('a.jpg').fitIn(300, 200, type).buildURL()).toBe(`${server}/unsafe/${segment}/300x200/a.jpg`)
  })

  test('alignment is lowercase', () => {
    expect(thumbor.setPath('a.jpg').resize(300, 200).halign(HorizontalPosition.LEFT).valign(VerticalPosition.TOP).buildURL())
      .toBe(`${server}/unsafe/300x200/left/top/a.jpg`)
  })

  test('segment order matches thumbor', () => {
    const url = thumbor
      .setPath('a.jpg')
      .filter('quality(80)')
      .smartCrop()
      .valign(VerticalPosition.MIDDLE)
      .halign(HorizontalPosition.RIGHT)
      .fitIn(300, 200)
      .crop({ left: 10, top: 20, right: 110, bottom: 220 })
      .trim()
      .buildURL()
    expect(url).toBe(`${server}/unsafe/trim/10x20:110x220/fit-in/300x200/right/middle/smart/filters:quality(80)/a.jpg`)
  })

  test('multiple filters', () => {
    expect(thumbor.setPath('a.jpg').filter('quality(80)').filter('format(webp)').buildURL())
      .toBe(`${server}/unsafe/filters:quality(80):format(webp)/a.jpg`)
  })

  test('state resets after buildURL', () => {
    thumbor.setPath('a.jpg').resize(300, 200).smartCrop().filter('grayscale()').buildURL()
    expect(thumbor.setPath('b.jpg').buildURL()).toBe(`${server}/unsafe/b.jpg`)
  })
})

describe('signed urls', () => {
  const key = 'MY_SECURE_KEY'
  const thumbor = createThumbor({ url: server, key })

  test('signature matches node:crypto hmac-sha1', () => {
    const path = '300x200/smart/thumbor.readthedocs.io/en/latest/_images/logo-thumbor.png'
    const url = thumbor.setPath('thumbor.readthedocs.io/en/latest/_images/logo-thumbor.png').resize(300, 200).smartCrop().buildURL()
    expect(url).toBe(`${server}/${nodeSign(key, path)}/${path}`)
  })

  test('sign handles every padding length and utf-8', () => {
    const inputs = ['', 'a', 'ab', 'abc', 'фото/кот.jpg', '😺.png', '\ud800x', 'x'.repeat(1000)]
    for (let n = 50; n < 70; n++) inputs.push('y'.repeat(n)) // around the 55/56/64 byte block edges
    const keys = [key, 'ключ', 'k'.repeat(64), 'k'.repeat(65), 'k'.repeat(200)]
    for (const k of keys) {
      for (const path of inputs) {
        expect(sign(k, path)).toBe(nodeSign(k, path))
      }
    }
  })
})
