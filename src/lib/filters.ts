// Helpers that build Thumbor filter calls, e.g. filters.quality(80) -> 'quality(80)'.
// Pass the result to Thumbor#filter(). Signatures follow thumbor/filters in Thumbor 7.8.
// Integer arguments are not rounded: Thumbor ignores a filter whose arguments don't match.

import type { WindowSizeAndPosition } from './types.ts'

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png' | 'gif' | 'heic' | 'heif'

/**
 * Watermark position: pixels from the left/top (negative from the right/bottom),
 * percent of the image (`'20p'`), `'center'` or `'repeat'`.
 */
export type WatermarkPosition = number | `${number}p` | 'center' | 'repeat'


function call(name: string, ...args: Array<string | number | boolean | undefined>) {
  while (args.length && args[args.length - 1] === undefined) args.pop()
  return `${name}(${args.map((a) => (a === undefined ? '' : String(a))).join(',')})`
}

export const filters = {
  /** `quality(0..100)`, for jpeg, webp and avif output. */
  quality: (value: number) => call('quality', value),

  /** `format(webp)`: output format. */
  format: (format: ImageFormat) => call('format', format),

  /** `blur(radius,sigma)`: radius is an integer > 0, sigma defaults to radius. */
  blur: (radius: number, sigma?: number) => call('blur', radius, sigma),

  /** `brightness(-100..100)`, integer. */
  brightness: (value: number) => call('brightness', value),

  /** `contrast(-100..100)`, integer. */
  contrast: (value: number) => call('contrast', value),

  /** `saturation(1.5)`: 1 keeps the image as is, 0 is grayscale. */
  saturation: (change: number) => call('saturation', change),

  /** `rgb(r,g,b)`: integers -100..100, percent per channel. */
  rgb: (red: number, green: number, blue: number) => call('rgb', red, green, blue),

  /** `grayscale()` */
  grayscale: () => call('grayscale'),

  /** `equalize()` */
  equalize: () => call('equalize'),

  /** `noise(amount,seed)`: amount 0..100. */
  noise: (amount: number, seed?: number) => call('noise', amount, seed),

  /** `sharpen(amount,radius,luminance_only)` */
  sharpen: (amount: number, radius: number, luminanceOnly = false) =>
    call('sharpen', amount, radius, luminanceOnly),

  /** `rotate(90)`: degrees, integer, rounded by Thumbor to a multiple of 90. */
  rotate: (angle: number) => call('rotate', angle),

  /**
   * `fill(color,fill_transparent)`: background for `fit-in` padding.
   * Color is a name (`white`), hex without `#` (`ff0000`), `transparent`, `auto` or `blur`.
   */
  fill: (color: string, fillTransparent?: boolean) => call('fill', color, fillTransparent),

  /** `background_color(color)`: fills transparent areas, color as in `fill`. */
  backgroundColor: (color: string) => call('background_color', color),

  /** `round_corner(a|b,r,g,b,transparent)`: radius or [horizontal, vertical], corner color as rgb. */
  roundCorner: (radius: number | [number, number], color: [number, number, number] = [255, 255, 255], transparent?: boolean) =>
    call('round_corner', Array.isArray(radius) ? radius.join('|') : radius, ...color, transparent),

  /** `colorize(red_pct,green_pct,blue_pct,fill)`: fill color as hex without `#`. */
  colorize: (redPct: number, greenPct: number, bluePct: number, fill: string) =>
    call('colorize', redPct, greenPct, bluePct, fill),

  /** `convolution(matrix,columns,should_normalize)` */
  convolution: (matrix: number[], columns: number, normalize = true) =>
    call('convolution', matrix.join(';'), columns, normalize),

  /** `focal(LxT:RxB)`: area that smart crop keeps in frame. */
  focal: ({ left, top, right, bottom }: WindowSizeAndPosition) => call('focal', `${left}x${top}:${right}x${bottom}`),

  /** `extract_focal()`: use the original crop of a Thumbor url as focal point. */
  extractFocal: () => call('extract_focal'),

  /** `no_upscale()`: don't enlarge images smaller than the requested size. */
  noUpscale: () => call('no_upscale'),

  /** `upscale()`: enlarge to fill the box with `fit-in`. */
  upscale: () => call('upscale'),

  /** `stretch()`: resize to the exact size, ignoring proportions. Works with resize, has no effect with fit-in. */
  stretch: () => call('stretch'),

  /** `proportion(0.5)`: scale after all other operations. */
  proportion: (value: number) => call('proportion', value),

  /** `strip_exif()` */
  stripExif: () => call('strip_exif'),

  /** `strip_icc()` */
  stripIcc: () => call('strip_icc'),

  /** `max_bytes(n)`: lowers quality until the file fits. If it can't get that small, Thumbor returns the image unchanged. */
  maxBytes: (bytes: number) => call('max_bytes', bytes),

  /** `max_age(seconds)`: Cache-Control max-age for this image. */
  maxAge: (seconds: number) => call('max_age', seconds),

  /**
   * `watermark(url,x,y,alpha,w_ratio,h_ratio)`.
   * alpha is transparency 0..100, ratios are max watermark size in percent of the image.
   */
  watermark: (url: string, x: WatermarkPosition, y: WatermarkPosition, alpha: number, widthRatio?: number, heightRatio?: number) =>
    call('watermark', url, x, y, alpha, widthRatio ?? (heightRatio === undefined ? undefined : 'none'), heightRatio),

  /** `frame(url)`: nine-patch frame image. */
  frame: (url: string) => call('frame', url)
}
