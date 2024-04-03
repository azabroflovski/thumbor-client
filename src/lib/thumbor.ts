import crypto from 'crypto'
import { isDefined } from '../helpers'
import { Parameters, ThumborClientOptions, WindowSizeAndPosition } from './types.ts'
import { FitInType, HorizontalPosition, VerticalPosition } from './enums.ts'

/**
 * Class representing a Thumbor client for generating image URLs.
 */
export class Thumbor {
    private readonly url: string
    private readonly key?: string
    private parameters: Parameters = this.defaultParameters()

    /**
     * Constructs a new Thumbor instance.
     * @param url The URL of the Thumbor server.
     * @param key Optional security key for accessing the Thumbor server.
     */
    constructor({ url, key }: ThumborClientOptions) {
        this.url = url
        this.key = key
    }

    /**
     * Creates default parameters.
     * @returns Default parameters object.
     */
    public defaultParameters(): Parameters {
        return {
            imagePath: '',
            width: 0,
            height: 0,
            smart: false,
            trimFlag: false,
            withFlipHorizontally: false,
            withFlipVertically: false,
            filtersCalls: []
        }
    }

    /**
     * Sets the image path from a URL.
     * @param url The URL of the image.
     * @returns The Thumbor instance.
     */
    public fromUrl(url: string) {
        this.parameters.imagePath = url
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
    public resize(width: Parameters['width'], height: Parameters['height']) {
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
     * Sets trim flag.
     * @returns The Thumbor instance.
     */
    public trim() {
        this.parameters.trimFlag = true
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
     * Adds a filter call for image processing.
     * @param filterCall The filter call.
     * @returns The Thumbor instance.
     */
    public filter(filterCall: string) {
        this.parameters.filtersCalls.push(filterCall)
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
        const operation = this.getOperationPath()
        const dataToEncrypt = operation + '/' + this.parameters.imagePath

        if (this.key) {
            const digest = crypto
                .createHmac('sha1', this.key)
                .update(dataToEncrypt)
                .digest('base64')
                .replace(/\+/g, '-').replace(/\//g, '_')

            this.parameters = this.defaultParameters()

            return this.url + '/' + digest + '/' + dataToEncrypt
        }

        this.parameters = this.defaultParameters()

        return this.url + '/unsafe/' + dataToEncrypt
    }

    /**
     * Constructs URL parts based on parameters.
     * @returns Array of URL parts.
     */
    private getURLParts() {
        const parts = []

        if (this.parameters.trimFlag) {
            parts.push('trim')
        }

        if (this.parameters.cropValues) {
            parts.push(
                this.parameters.cropValues.left.toString() +
                'x' + this.parameters.cropValues.top.toString() +
                ':' + this.parameters.cropValues.right.toString() +
                'x' + this.parameters.cropValues.bottom.toString()
            )
        }

        switch (this.parameters.fitInType) {
            case FitInType.DEFAULT:
                parts.push('fit-in')
                break
            case FitInType.FULL:
                parts.push('full-fit-in')
                break
            case FitInType.ADAPTIVE:
                parts.push('adaptative-fit-in')
                break
            default:
                break
        }

        if (
            isDefined(this.parameters.width) ||
            isDefined(this.parameters.height) ||
            this.parameters.withFlipHorizontally ||
            this.parameters.withFlipVertically
        ) {
            let sizeString = ''

            if (this.parameters.withFlipHorizontally) {
                sizeString += '-'
            }

            sizeString += this.parameters.width

            sizeString += 'x'

            if (this.parameters.withFlipVertically) {
                sizeString += '-'
            }

            sizeString += this.parameters.height

            parts.push(sizeString)
        }

        if (this.parameters.halignValue) {
            parts.push(this.parameters.halignValue)
        }

        if (this.parameters.valignValue) {
            parts.push(this.parameters.valignValue)
        }

        if (this.parameters.smart) {
            parts.push('smart')
        }

        if (this.parameters.filtersCalls.length > 0) {
            parts.push('filters:' + this.parameters.filtersCalls.join(':'))
        }

        return parts
    }

    /**
     * Constructs the operation path for the URL.
     * @returns The constructed operation path.
     */
    private getOperationPath() {
        const parts = this.getURLParts()

        if (parts.length === 0) {
            return ''
        }

        return parts.join('/')
    }
}
