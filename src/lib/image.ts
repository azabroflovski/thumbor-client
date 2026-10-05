import { composeUrl, defaultParameters } from './compose.ts'
import { FitInType } from './enums.ts'
import { filters } from './filters.ts'
import type { ThumborParameters, TrimOrientation, WindowSizeAndPosition } from './types.ts'

export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'
export type FlipDirection = 'horizontal' | 'vertical' | 'both'
export type Size = number | 'orig'

export interface FitInOptions {
  /** `full-fit-in`: the smaller side fills the box, the other may be bigger. */
  full?: boolean
  /** `adaptive-fit-in`: swaps width and height if that fits the image orientation better. */
  adaptive?: boolean
}

export interface ImageOptions {
  /** Encode the source with encodeURIComponent, for urls with a query string. */
  encode?: boolean
}

type Filters = typeof filters

/** Every `filters.*` helper as a builder method: `.quality(80)` is `.filter(filters.quality(80))`. */
export type FilterMethods = {
  [K in keyof Filters]: (...args: Parameters<Filters[K]>) => ThumborImage
}

/**
 * One image with its operations. Immutable: every method returns a new instance,
 * so a partly built image can be reused as a preset.
 *
 * Get the url with `.url()`, `String(image)` or a template string. `JSON.stringify` also gives the url.
 */
export class ThumborImage {
  private readonly server: string
  private readonly key: string | undefined
  private readonly params: Readonly<ThumborParameters>

  /** @internal use `thumbor.image(src)` */
  constructor(server: string, key: string | undefined, params: ThumborParameters) {
    this.server = server
    this.key = key
    this.params = params
  }

  private with(patch: Partial<ThumborParameters>) {
    return new ThumborImage(this.server, this.key, { ...this.params, ...patch })
  }

  /**
   * Resize, cropping to fill the box when proportions differ. `0` keeps proportions, `'orig'` keeps the original size.
   * Replaces a previous `fitIn()`.
   */
  resize(width: Size, height: Size) {
    return this.with({ width, height, fitInType: undefined })
  }

  /**
   * Fit into the box without cropping: `fit-in`, `full-fit-in`, `adaptive-fit-in`, `adaptive-full-fit-in`.
   * Replaces a previous `resize()`.
   */
  fitIn(width: Size, height: Size, options: FitInOptions | FitInType = {}) {
    const fitInType = typeof options === 'string'
      ? options
      : options.adaptive
        ? (options.full ? FitInType.ADAPTIVE_FULL : FitInType.ADAPTIVE)
        : (options.full ? FitInType.FULL : FitInType.DEFAULT)
    return this.with({ width, height, fitInType })
  }

  /** Mirror the image. Replaces a previous `flip()`. */
  flip(direction: FlipDirection) {
    return this.with({
      withFlipHorizontally: direction !== 'vertical',
      withFlipVertically: direction !== 'horizontal'
    })
  }

  /** Manual crop in pixels of the original image, applied before resizing. */
  crop(rect: WindowSizeAndPosition) {
    return this.with({ cropValues: { ...rect } })
  }

  /** Which part to keep when resize crops. Thumbor defaults to center and middle. */
  align(horizontal?: HorizontalAlign, vertical?: VerticalAlign) {
    return this.with({
      halignValue: horizontal as ThumborParameters['halignValue'],
      valignValue: vertical as ThumborParameters['valignValue']
    })
  }

  /** Smart crop: keep detected faces and features in frame. */
  smart(enabled = true) {
    return this.with({ smart: enabled })
  }

  /**
   * Remove the border of the same color: `trim`, `trim:bottom-right:10`.
   * @param orientation Pixel used as the border color, Thumbor defaults to top-left.
   * @param tolerance Color distance still treated as the same color, 0..442.
   */
  trim(orientation?: TrimOrientation, tolerance?: number) {
    return this.with({ trimFlag: true, trimOrientation: orientation, trimTolerance: tolerance })
  }

  /** Thumbor returns JSON with sizes and operations instead of the image. */
  meta(enabled = true) {
    return this.with({ meta: enabled })
  }

  /** Thumbor draws detected focal points on the image. */
  debug(enabled = true) {
    return this.with({ debug: enabled })
  }

  /** Add filter calls: `filter(filters.quality(80), 'format(webp)')`. */
  filter(...calls: string[]) {
    return this.with({ filtersCalls: [...this.params.filtersCalls, ...calls] })
  }

  /** The Thumbor url. */
  url() {
    return composeUrl(this.server, this.key, this.params)
  }

  /**
   * `srcset` value for the given widths. Height scales with the width; a fixed `0` stays `0`.
   * Without a size set, each entry is `resize(width, 0)`.
   */
  srcset(widths: number[]) {
    const { width, height, fitInType } = this.params
    return widths
      .map((w) => {
        const h = typeof width === 'number' && width > 0 && typeof height === 'number'
          ? Math.round((height * w) / width)
          : 0
        const sized = this.with({ width: w, height: h, fitInType })
        return `${sized.url()} ${w}w`
      })
      .join(', ')
  }

  toString() {
    return this.url()
  }

  toJSON() {
    return this.url()
  }
}

export interface ThumborImage extends FilterMethods {}

for (const name of Object.keys(filters) as Array<keyof Filters>) {
  Object.defineProperty(ThumborImage.prototype, name, {
    value(this: ThumborImage, ...args: unknown[]) {
      return this.filter((filters[name] as (...a: unknown[]) => string)(...args))
    },
    writable: true,
    configurable: true
  })
}

/** Builds the starting point for `thumbor.image(src)`. */
export function createImage(server: string, key: string | undefined, src: string, options: ImageOptions = {}) {
  const imagePath = options.encode
    ? encodeURIComponent(src)
    : src.startsWith('/') ? src.slice(1) : src
  return new ThumborImage(server, key, { ...defaultParameters(), imagePath })
}
