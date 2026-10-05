import { composeUrl, defaultParameters } from './compose.ts'
import type { FromUrlOptions, ThumborParameters, ThumborClientOptions, TrimOrientation, WindowSizeAndPosition } from './types.ts'
import { FitInType, type HorizontalPosition, type VerticalPosition } from './enums.ts'

/**
 * Class representing a Thumbor client for generating image URLs.
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
   * Creates default parameters.
   * @returns Default parameters object.
   */
  public defaultParameters(): ThumborParameters {
    return defaultParameters()
  }

  /**
   * Sets the image path from a URL.
   * @param url The URL of the image.
   * @param options `{ encode: true }` encodes the url, needed when it has a query string.
   * @returns The Thumbor instance.
   */
  public fromUrl(url: string, options: FromUrlOptions = {}) {
    this.parameters.imagePath = options.encode ? encodeURIComponent(url) : url
    return this
  }

  /**
   * Sets the path of the image.
   * @param path The path of the image.
   * @returns The Thumbor instance.
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
   */
  public meta(enabled: boolean = true) {
    this.parameters.meta = enabled
    return this
  }

  /**
   * Debug mode: Thumbor draws detected focal points on the image.
   * @returns The Thumbor instance.
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
   */
  public flipHorizontally() {
    this.parameters.withFlipHorizontally = true
    return this
  }

  /**
   * Flips the image vertically.
   * @returns The Thumbor instance.
   */
  public flipVertically() {
    this.parameters.withFlipVertically = true
    return this
  }

  /**
   * Sets horizontal alignment.
   * @param halign The horizontal alignment value.
   * @returns The Thumbor instance.
   */
  public halign(halign: HorizontalPosition) {
    this.parameters.halignValue = halign
    return this
  }

  /**
   * Sets vertical alignment.
   * @param valign The vertical alignment value.
   * @returns The Thumbor instance.
   */
  public valign(valign: VerticalPosition) {
    this.parameters.valignValue = valign
    return this
  }

  /**
   * Adds filter calls: `filter('quality(80)')` or `filter(filters.quality(80), filters.format('webp'))`.
   * @param filterCalls Filter calls.
   * @returns The Thumbor instance.
   */
  public filter(...filterCalls: string[]) {
    this.parameters.filtersCalls.push(...filterCalls)
    return this
  }

  /**
   * Sets crop values for the image.
   * @param crop The crop values.
   * @returns The Thumbor instance.
   */
  public crop(crop: WindowSizeAndPosition) {
    this.parameters.cropValues = crop
    return this
  }

  /**
   * Builds the URL for the image with applied operations.
   * @returns The generated image URL.
   */
  public buildURL() {
    try {
      return composeUrl(this.url, this.key, this.parameters)
    } finally {
      this.parameters = this.defaultParameters()
    }
  }
}
