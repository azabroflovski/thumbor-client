import { expect, test } from 'vitest'
import { filters as f } from './main.ts'

test.each([
  [f.quality(80), 'quality(80)'],
  [f.format('webp'), 'format(webp)'],
  [f.blur(5), 'blur(5)'],
  [f.blur(5, 2.5), 'blur(5,2.5)'],
  [f.brightness(-40), 'brightness(-40)'],
  [f.contrast(40), 'contrast(40)'],
  [f.saturation(1.5), 'saturation(1.5)'],
  [f.rgb(10, -20, 0), 'rgb(10,-20,0)'],
  [f.grayscale(), 'grayscale()'],
  [f.equalize(), 'equalize()'],
  [f.noise(40), 'noise(40)'],
  [f.noise(40, 7), 'noise(40,7)'],
  [f.sharpen(2, 1), 'sharpen(2,1,false)'],
  [f.sharpen(2, 1, true), 'sharpen(2,1,true)'],
  [f.rotate(90), 'rotate(90)'],
  [f.fill('ff0000'), 'fill(ff0000)'],
  [f.fill('transparent', true), 'fill(transparent,true)'],
  [f.backgroundColor('white'), 'background_color(white)'],
  [f.roundCorner(20), 'round_corner(20,255,255,255)'],
  [f.roundCorner([20, 10], [0, 0, 0], true), 'round_corner(20|10,0,0,0,true)'],
  [f.colorize(100, 0, 0, 'ff0000'), 'colorize(100,0,0,ff0000)'],
  [f.convolution([1, 2, 1, 2, 4, 2, 1, 2, 1], 3), 'convolution(1;2;1;2;4;2;1;2;1,3,true)'],
  [f.focal({ left: 10, top: 20, right: 30, bottom: 40 }), 'focal(10x20:30x40)'],
  [f.extractFocal(), 'extract_focal()'],
  [f.noUpscale(), 'no_upscale()'],
  [f.upscale(), 'upscale()'],
  [f.stretch(), 'stretch()'],
  [f.proportion(0.5), 'proportion(0.5)'],
  [f.stripExif(), 'strip_exif()'],
  [f.stripIcc(), 'strip_icc()'],
  [f.maxBytes(50000), 'max_bytes(50000)'],
  [f.maxAge(3600), 'max_age(3600)'],
  [f.watermark('logo.png', 10, -10, 50), 'watermark(logo.png,10,-10,50)'],
  [f.watermark('logo.png', '20p', 'center', 0, 30), 'watermark(logo.png,20p,center,0,30)'],
  [f.watermark('logo.png', 'repeat', 'repeat', 0, undefined, 30), 'watermark(logo.png,repeat,repeat,0,none,30)'],
  [f.frame('frame.png'), 'frame(frame.png)']
])('%s', (actual, expected) => {
  expect(actual).toBe(expected)
})
