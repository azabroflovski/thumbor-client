import { composeUrl, defaultParameters } from './compose.ts'
import { createImage, type ImageOptions } from './image.ts'
import type { FromUrlOptions, ThumborParameters, ThumborClientOptions, TrimOrientation, WindowSizeAndPosition } from './types.ts'
import { FitInType, type HorizontalPosition, type VerticalPosition } from './enums.ts'

/**
 * Thumbor client. Start images with `image(src)`.
 *
 * The chain methods on the client itself (`fromUrl`, `resize`, ..., `buildURL`) are the old mutable API.
 * They keep working and are deprecated.
 */
export class Thumbor {
  private readonly url: string
  private readonly key?: string
  private parameters: ThumborParameters = this.defaultParameters()

  /**
   * Constructs a new Thumbor instance.
   * @param url The URL of the Thumbor server.
   * @param key Optional security key for accessing the Thumbor server.
   */
  constructor({ url, key }: ThumborClientOptions) {
    this.url = url.replace(/\/+$/, '')
    this.key = key
  }

  /**
   * Starts a new image. Every call returns an independent, immutable builder:
   *
   * ```ts
   * thumbor.image('https://example.com/cat.jpg').resize(300, 200).smart().quality(80).url()
   * ```
   * @param src Image url or path. A leading `/` is removed from paths.
   */
  public image(src: string, options?: ImageOptions) {
    return createImage(this.url, this.key, src, options)
  }

  /**
   * Creates default parameters.
   * @returns Default parameters object.
   * @deprecated Internal state, will be removed.
   */
  public defaultParameters(): ThumborParameters {
    return defaultParameters()
  }

  /**
   * Sets the image path from a URL.
   * @param url The URL of the image.
   * @param options `{ encode: true }` encodes the url, needed when it has a query string.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(url)`, `thumbor.image(url, { encode: true })`.
   */
  public fromUrl(url: string, options: FromUrlOptions = {}) {
    this.parameters.imagePath = options.encode ? encodeURIComponent(url) : url
    return this
  }

  /**
   * Sets the path of the image.
   * @param path The path of the image.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(path)`.
   */
  public setPath(path: string) {
    this.parameters.imagePath = (path.startsWith('/')) ? path.slice(1, path.length) : path
    return this
  }

  /**
   * Resizes the image.
   * @param width The width of the image.
   * @param height The height of the image.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).resize(width, height)`.
   */
  public resize(width: ThumborParameters['width'], height: ThumborParameters['height']) {
    this.parameters.width = width
    this.parameters.height = height
    this.parameters.fitInType = undefined
    return this
  }

  /**
   * Sets smart cropping flag.
   * @param smartCrop Flag indicating whether to use smart cropping.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).smart()`.
   */
  public smartCrop(smartCrop: boolean = true) {
    this.parameters.smart = smartCrop
    return this
  }

  /**
   * Removes surrounding space of the same color: `trim`, `trim:bottom-right:10`.
   * @param orientation Pixel used as the color reference, Thumbor defaults to top-left.
   * @param tolerance Color distance still treated as the same color, 0..442.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).trim(orientation, tolerance)`.
   */
  public trim(orientation?: TrimOrientation, tolerance?: number) {
    this.parameters.trimFlag = true
    this.parameters.trimOrientation = orientation
    this.parameters.trimTolerance = tolerance
    return this
  }

  /**
   * Returns JSON with the image size and the operations Thumbor would apply, instead of the image.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).meta()`.
   */
  public meta(enabled: boolean = true) {
    this.parameters.meta = enabled
    return this
  }

  /**
   * Debug mode: Thumbor draws detected focal points on the image.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).debug()`.
   */
  public debug(enabled: boolean = true) {
    this.parameters.debug = enabled
    return this
  }

  /**
   * Sets fit-in parameters.
   * @param width The width to fit in.
   * @param height The height to fit in.
   * @param type The fitting type.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).fitIn(width, height, { full, adaptive })`.
   */
  public fitIn(width: number, height: number, type = FitInType.DEFAULT) {
    this.parameters.width = width
    this.parameters.height = height
    this.parameters.fitInType = type
    return this
  }

  /**
   * Flips the image horizontally.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).flip('horizontal')`.
   */
  public flipHorizontally() {
    this.parameters.withFlipHorizontally = true
    return this
  }

  /**
   * Flips the image vertically.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).flip('vertical')`.
   */
  public flipVertically() {
    this.parameters.withFlipVertically = true
    return this
  }

  /**
   * Sets horizontal alignment.
   * @param halign The horizontal alignment value.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).align('left')`.
   */
  public halign(halign: HorizontalPosition) {
    this.parameters.halignValue = halign
    return this
  }

  /**
   * Sets vertical alignment.
   * @param valign The vertical alignment value.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).align(undefined, 'top')`.
   */
  public valign(valign: VerticalPosition) {
    this.parameters.valignValue = valign
    return this
  }

  /**
   * Adds filter calls: `filter('quality(80)')` or `filter(filters.quality(80), filters.format('webp'))`.
   * @param filterCalls Filter calls.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).filter(...)` or filter methods like `.quality(80)`.
   */
  public filter(...filterCalls: string[]) {
    this.parameters.filtersCalls.push(...filterCalls)
    return this
  }

  /**
   * Sets crop values for the image.
   * @param crop The crop values.
   * @returns The Thumbor instance.
   * @deprecated Use `thumbor.image(src).crop(rect)`.
   */
  public crop(crop: WindowSizeAndPosition) {
    this.parameters.cropValues = crop
    return this
  }

  /**
   * Builds the URL for the image with applied operations.
   * @returns The generated image URL.
   * @deprecated Use `thumbor.image(src)....url()`.
   */
  public buildURL() {
    try {
      return composeUrl(this.url, this.key, this.parameters)
    } finally {
      this.parameters = this.defaultParameters()
    }
  }
}
