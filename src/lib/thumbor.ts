import crypto from 'crypto'
import { isDefined } from '../helpers'
import {Parameters, ThumborClientOptions, WindowSizeAndPosition} from './types.ts'
import { FitInType, HorizontalPosition, VerticalPosition } from './enums.ts'

export class Thumbor {
    private readonly url: string
    private readonly key?: string

    private parameters: Parameters = this.defaultParameters()

    constructor({url, key}: ThumborClientOptions) {
        this.url = url
        this.key = key
    }

    defaultParameters(): Parameters {
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

    fromUrl(url: string) {
        this.parameters.imagePath = url
        return this
    }

    setPath(path: string) {
        this.parameters.imagePath = (path.startsWith('/')) ? path.slice(1, path.length) : path

        return this
    }

    resize(width: Parameters['width'], height: Parameters['height']) {
        this.parameters.width = width
        this.parameters.height = height
        this.parameters.fitInType = undefined
        return this
    }

    smartCrop(smartCrop: boolean = true) {
        this.parameters.smart = smartCrop
        return this
    }

    trim() {
        this.parameters.trimFlag = true
        return this
    }

    fitIn(width: number, height: number, type = FitInType.DEFAULT) {
        this.parameters.width = width
        this.parameters.height = height
        this.parameters.fitInType = type
        return this
    }

    flipHorizontally() {
        this.parameters.withFlipHorizontally = true
        return this
    }

    flipVertically() {
        this.parameters.withFlipVertically = true
        return this
    }

    halign(halign: HorizontalPosition) {
        this.parameters.halignValue = halign
        return this
    }

    valign(valign: VerticalPosition) {
        this.parameters.valignValue = valign
        return this
    }

    filter(filterCall: string) {
        this.parameters.filtersCalls.push(filterCall)
        return this
    }

    crop(crop: WindowSizeAndPosition) {
        this.parameters.cropValues = crop
        return this
    }

    buildURL() {
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

    private getOperationPath() {
        const parts = this.getURLParts()

        if (parts.length === 0) {
            return ''
        }

        return parts.join('/')
    }
}
